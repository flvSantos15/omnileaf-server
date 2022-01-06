import { Exception } from '@adonisjs/core/build/standalone'
import {
  ImportJiraOrganizationRequest,
  ImportJiraProjectRequest,
  ImportJiraUserRequest,
  UpdateProjectTaskProps,
  ValidateTokenProps,
} from 'App/Interfaces/Jira/jira-integration-service.interfaces'
import JiraToken from 'App/Models/JiraToken'
import Organization from 'App/Models/Organization'
import Project from 'App/Models/Project'
import JiraApiService from './JiraApiService'
import User from 'App/Models/User'
import Task from 'App/Models/Task'
import Encryption from '@ioc:Adonis/Core/Encryption'
import Logger from '@ioc:Adonis/Core/Logger'
import IntegrationAssignPendences from 'App/Models/IntegrationAssignPendences'

class JiraIntegrationService {
  private async _validateUserAssignPendences(user: User) {
    const tasksToAssign = await IntegrationAssignPendences.query().where('jiraId', user.jiraId)

    if (!tasksToAssign.length) return

    const taskIds = tasksToAssign.map((assignment) => assignment.taskId)

    await user.related('assignedTasks').sync(taskIds)

    await IntegrationAssignPendences.query().where('jiraId', user.jiraId).delete()
  }

  public async importUser({ payload, user, bouncer }: ImportJiraUserRequest) {
    const { token } = payload

    if (!user) {
      throw new Exception('User not found', 404)
    }

    if (user.jiraId) {
      throw new Exception('User is already integrated with Jira', 400)
    }

    await bouncer.authorize('OwnUser', user.id)

    const jiraUser = await JiraApiService.getMe({ token: token.access_token })

    if (!jiraUser) {
      throw new Exception('Could not find user data on Jira API.', 400)
    }

    await JiraToken.create({
      ...token,
      token: token.access_token,
      ownerId: user.id,
      createdTime: Math.floor(new Date().getTime() / 1000),
    })

    await user.merge({ jiraId: jiraUser.account_id }).save()

    await this._validateUserAssignPendences(user)
  }

  public async importOrganization({ id, payload, user, bouncer }: ImportJiraOrganizationRequest) {
    const { jiraSiteId } = payload

    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization not found', 404)
    }

    await user.load('jiraToken')

    if (!user.jiraId || !user.jiraToken) {
      throw new Exception('User is not integrated with Jira', 400)
    }

    await bouncer.authorize('OrganizationManager', organization)

    await organization.merge({ jiraId: jiraSiteId }).save()

    await user.jiraToken.merge({ organizationId: organization.id }).save()
  }

  private _tokenIsValid({ expiresIn, createdAt }: ValidateTokenProps) {
    const fiveMinutesBeforeExpires = expiresIn - 60 * 5
    const fiveMinuteBeforeExpiresInSec = createdAt + fiveMinutesBeforeExpires
    const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000)

    return currentTimeInSeconds < fiveMinuteBeforeExpiresInSec
  }

  private async _updateToken(token: JiraToken) {
    const newToken = await JiraApiService.refreshToken(
      Encryption.decrypt(token.refreshToken) as string
    )

    await token
      .merge({
        token: newToken.access_token,
        refreshToken: newToken.refresh_token,
        expiresIn: newToken.expires_in,
        createdTime: Math.floor(new Date().getTime() / 1000),
      })
      .save()

    return token
  }

  private async _getOrgToken(organizationId: string): Promise<string> {
    const organization = await Organization.find(organizationId)

    if (!organization) {
      throw new Exception('Organization not found.', 404)
    }

    await organization.load('jiraToken')

    if (!organization.jiraId || !organization.jiraToken) {
      throw new Exception('Organization is not integrated with Gitlab.', 400)
    }

    const tokenIsValid = this._tokenIsValid({
      expiresIn: organization.jiraToken.expiresIn,
      createdAt: organization.jiraToken.createdTime,
    })

    if (tokenIsValid) {
      return Encryption.decrypt(organization.jiraToken.token) as string
    }

    const updatedToken = await this._updateToken(organization.jiraToken)
    Logger.info('Organization token succesfully refreshed')
    return Encryption.decrypt(updatedToken.token) as string
  }

  /**
   *
   * Handle Update Project
   */
  private async _updateProjectTasks({ project, tasks }: UpdateProjectTaskProps) {
    await project.load('tasks')
    // Update or create found tasks.
    tasks.forEach(async (task) => {
      const searchPayload = { jiraId: task.id }
      const persistancePayload = {
        name: task.fields.summary,
        projectId: project.id,
        jiraId: task.id,
        createdAt: task.fields.created,
        timeEstimated: task.fields.timeestimate && task.fields.timeestimate,
      }
      const taskPayload = await Task.updateOrCreate(searchPayload, persistancePayload)

      // Assign user to task
      if (task.fields.assignee) {
        const userToAssign = await User.findBy('jiraId', task.fields.assignee.accountId)
        if (!userToAssign) {
          await IntegrationAssignPendences.create({
            taskId: taskPayload.id,
            jiraId: task.fields.assignee.accountId,
          })
          return
        }
        await taskPayload.load('usersAssigned')
        if (!taskPayload.usersAssigned.map((user) => user.jiraId).includes(userToAssign.jiraId)) {
          await taskPayload.related('usersAssigned').attach([userToAssign.id])
        }
      }
    })

    // Check if existing tasks are still in Jira project, and if not, delete.
    project.tasks.forEach(async (existingTask) => {
      if (!existingTask.jiraId) return
      if (!tasks.map((task) => task.id).includes(existingTask.jiraId)) {
        await existingTask.delete()
      }
    })
  }

  public async updateProject(project: Project, token: string): Promise<void> {
    if (!project) return
    if (!project.jiraId) return

    await project.load('organization')

    const cloudId = project.organization.jiraId

    const tasks = await JiraApiService.getProjectIssues({
      id: project.jiraId,
      cloudId,
      token: token,
    })
    await this._updateProjectTasks({ project, tasks })
  }

  /**
   *
   * Handle Import Project
   */
  public async importProject({ payload, bouncer }: ImportJiraProjectRequest) {
    const { projectId, jiraId } = payload

    const projectIsImported = await Project.findBy('jiraId', jiraId)

    if (projectIsImported) {
      throw new Exception('Project is already integrated with Jira', 409)
    }

    let project = await Project.find(projectId)

    if (!project) {
      throw new Exception('Project not found', 404)
    }

    await project.load('organization')

    const organization = project.organization

    await organization.load('jiraToken')

    if (!organization.jiraId || !organization.jiraToken) {
      throw new Exception('Organization is not integrated with Gitlab.', 400)
    }

    await bouncer.authorize('OrganizationManager', organization)

    const token = await this._getOrgToken(project.organizationId)

    project = await project.merge({ jiraId }).save()

    await JiraApiService.registerProjectWebhook({
      id: project.id,
      cloudId: organization.jiraId,
      token,
    })

    await this.updateProject(project, token)
  }
}

export default new JiraIntegrationService()
