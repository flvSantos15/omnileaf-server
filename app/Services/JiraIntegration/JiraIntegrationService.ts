import { Exception } from '@adonisjs/core/build/standalone'
import {
  AssignUserFromJiraToTaskProps,
  ImportJiraOrganizationRequest,
  ImportJiraProjectRequest,
  ImportJiraUserRequest,
  UpdateOrCreateTaskFromJiraIssueProps,
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
import { JiraIssue } from 'App/Interfaces/Jira/jira-issue.interface'
import { TaskStatus } from 'Contracts/enums'

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

  private _getTaskStatusFromJiraIssue(jiraStatus: string) {
    const status = jiraStatus.toLowerCase()
    if (status === 'closed' || status === 'done') {
      return TaskStatus.CLOSED
    }
    return TaskStatus.IN_PROGRESS
  }

  private async _updateOrCreateTaskFromJiraIssue({
    issue,
    projectId,
  }: UpdateOrCreateTaskFromJiraIssueProps) {
    const searchPayload = { jiraId: issue.id }
    const persistancePayload = {
      name: issue.fields.summary,
      projectId,
      status: this._getTaskStatusFromJiraIssue(issue.fields.status.name),
      jiraId: issue.id,
      createdAt: issue.fields.created,
      timeEstimated: issue.fields.timeestimate && issue.fields.timeestimate,
    }
    const taskPayload = await Task.updateOrCreate(searchPayload, persistancePayload)
    return taskPayload
  }

  private async _updateProjectTasks({ project, issues }: UpdateProjectTaskProps) {
    await project.load('tasks')
    // Update or create found tasks.
    issues.forEach(async (issue) => {
      const taskPayload = await this._updateOrCreateTaskFromJiraIssue({
        issue,
        projectId: project.id,
      })

      // Assign user to task
      if (issue.fields.assignee) {
        const userToAssign = await User.findBy('jiraId', issue.fields.assignee.accountId)
        if (!userToAssign) {
          await IntegrationAssignPendences.create({
            taskId: taskPayload.id,
            jiraId: issue.fields.assignee.accountId,
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
      if (!issues.map((issue) => issue.id).includes(existingTask.jiraId)) {
        await existingTask.delete()
      }
    })
  }

  public async updateProject(project: Project, token: string): Promise<void> {
    if (!project) return
    if (!project.jiraId) return

    await project.load('organization')

    const cloudId = project.organization.jiraId

    const issues = await JiraApiService.getProjectIssues({
      id: project.jiraId,
      cloudId,
      token: token,
    })
    await this._updateProjectTasks({ project, issues })
  }

  /**
   *
   * Handle Import Project
   */

  public async importProject({ id, payload, bouncer }: ImportJiraProjectRequest) {
    const { jiraId } = payload

    const projectIsImported = await Project.findBy('jiraId', jiraId)

    if (projectIsImported) {
      throw new Exception('Project is already integrated with Jira', 409)
    }

    let project = await Project.find(id)

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
      id: project.jiraId,
      cloudId: organization.jiraId,
      token,
    })

    await this.updateProject(project, token)
  }

  /**
   *
   * Handle Project Changes From Webhook
   */

  private async _updateTaskAssignmentsOnWebhook({
    task,
    issueAssignee,
  }: AssignUserFromJiraToTaskProps) {
    if (!issueAssignee) {
      await task.related('usersAssigned').detach()
      return
    }

    const { accountId } = issueAssignee

    const user = await User.findBy('jiraId', accountId)

    if (!user) {
      return Logger.info('User to assign not found')
    }

    await task.load('usersAssigned')

    if (task.usersAssigned.length) {
      await task.related('usersAssigned').detach([task.usersAssigned[0].id])
    }

    await task.related('usersAssigned').attach([user.id])
  }

  public async createOrUpdateIssueByWebHook(issue: JiraIssue) {
    const project = await Project.findBy('jiraId', issue.fields.project.id)

    if (!project) {
      return Logger.info('Project not found')
    }

    const taskPayload = await this._updateOrCreateTaskFromJiraIssue({
      issue,
      projectId: project.id,
    })

    await this._updateTaskAssignmentsOnWebhook({
      task: taskPayload,
      issueAssignee: issue.fields.assignee,
    })
  }

  public async deleteIssueByWebhook(jiraId: string) {
    const task = await Task.findBy('jiraId', jiraId)
    if (task) {
      await task.merge({ isDeleted: true }).save()
    }
  }
}

export default new JiraIntegrationService()
