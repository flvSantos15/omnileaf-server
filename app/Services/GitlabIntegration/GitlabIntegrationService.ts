import { Exception } from '@adonisjs/core/build/standalone'
import {
  RefreshProjectTasksRequest,
  UpdateTokenRequest,
  ValidateTokenRequest,
} from 'App/Interfaces/Gitlab/gitlab-api-service.interfaces'
import GitlabToken from 'App/Models/GitlabToken'
import Organization from 'App/Models/Organization'
import Project from 'App/Models/Project'
import Task from 'App/Models/Task'
import User from 'App/Models/User'
import GitlabApiService from './GitlabApiService'
import {
  AssignUserFromGitlabToTaskProps,
  GitlabIssueFromWebhook,
  ImportOrganizationRequest,
  ImportProjectRequest,
  ImportUserRequest,
} from 'App/Interfaces/Gitlab/gitlab-integration-service.interfaces'
import Encryption from '@ioc:Adonis/Core/Encryption'
import { TaskStatus } from 'Contracts/enums'
import IntegrationAssignPendences from 'App/Models/IntegrationAssignPendences'
import Logger from '@ioc:Adonis/Core/Logger'
import { GitlabIssue } from 'App/Interfaces/Gitlab/gitlab-issue.interface'
import Webhook from 'App/Models/Webhook'

class GitlabIntegrationService {
  /**
   *
   * Get user Gitlab token
   *
   */
  //TO-DO: Validates if getUserToken will be necessary
  public async _getUserToken(user?: User): Promise<string> {
    if (!user) {
      throw new Exception('User not found.', 400)
    }

    await user.load('gitlabToken')

    if (!user.gitlabId || !user.gitlabToken) {
      throw new Exception('User is not integrated with Gitlab.', 400)
    }

    const tokenIsValid = this._tokenIsValid({
      expiresIn: user.gitlabToken.expiresIn,
      createdAt: user.gitlabToken.createdTime,
    })

    if (!tokenIsValid) {
      const updatedToken = await this._updateToken({ existingToken: user.gitlabToken })
      return Encryption.decrypt(updatedToken.token)!
    }

    return Encryption.decrypt(user.gitlabToken.token)!
  }

  /**
   *
   * Check if there is any assignments to do when user is integrated with Gitlab
   *  if so, assign.
   */
  private async _validateUserAssignPendences(user: User) {
    const tasksToAssign = await IntegrationAssignPendences.query().where('gitlabId', user.gitlabId)

    if (!tasksToAssign.length) return

    const taskIds = tasksToAssign.map((assignment) => assignment.taskId)

    await user.related('assignedTasks').sync(taskIds)

    await IntegrationAssignPendences.query().where('gitlabId', user.gitlabId).delete()
  }

  /**
   *
   * Integrate user with Gitlab
   */
  public async importUser({ payload, user, bouncer }: ImportUserRequest): Promise<void> {
    const { gitlabId, token } = payload

    if (!user) {
      throw new Exception('User not found', 404)
    }

    await bouncer.authorize('OwnUser', user.id)

    await user.merge({ gitlabId }).save()

    await GitlabToken.create({
      ownerId: user.id,
      token: token.access_token,
      refreshToken: token.refresh_token,
      expiresIn: token.expires_in,
      createdTime: token.created_at,
    })

    await this._validateUserAssignPendences(user)
  }

  /**
   *
   * Integrate Organization with Gitlab
   */
  public async importOrganization({
    id,
    payload,
    user,
    bouncer,
  }: ImportOrganizationRequest): Promise<void> {
    const { gitlabId } = payload

    const organization = await Organization.find(id)

    if (!organization) {
      throw new Exception('Organization not found.', 404)
    }

    await user.load('gitlabToken')

    if (!user.gitlabId || !user.gitlabToken) {
      throw new Exception('User is not integrated with Gitlab', 400)
    }

    await bouncer.authorize('OrganizationCreator', organization)

    await organization.merge({ gitlabId }).save()

    await user.gitlabToken.merge({ organizationId: id }).save()
  }

  /**
   *
   * Check if token is not expired
   *
   */
  private _tokenIsValid({ expiresIn, createdAt }: ValidateTokenRequest) {
    const expirationTime = (createdAt + expiresIn) * 1000
    const currentTime = new Date().getTime()

    return currentTime < expirationTime
  }

  /**
   *
   * Update token
   *
   */
  private async _updateToken({ existingToken }: UpdateTokenRequest) {
    const token = await GitlabApiService.refreshToken(
      Encryption.decrypt(existingToken.refreshToken)!
    )

    await existingToken
      .merge({
        token: token.access_token,
        refreshToken: token.refresh_token,
        expiresIn: token.expires_in,
        createdTime: token.created_at,
      })
      .save()

    return existingToken
  }

  /**
   *
   * Load valid Organization token
   *
   */
  private async _getOrgToken(organizationId: string): Promise<string> {
    const organization = await Organization.find(organizationId)

    if (!organization) {
      throw new Exception('Organization not found.', 404)
    }

    await organization.load('gitlabToken')

    if (!organization.gitlabId || !organization.gitlabToken) {
      throw new Exception('Organization is not integrated with Gitlab.', 400)
    }

    const tokenIsValid = this._tokenIsValid({
      expiresIn: organization.gitlabToken.expiresIn,
      createdAt: organization.gitlabToken.createdTime,
    })

    if (!tokenIsValid) {
      const updatedToken = await this._updateToken({ existingToken: organization.gitlabToken })
      return Encryption.decrypt(updatedToken.token)!
    }

    return Encryption.decrypt(organization.gitlabToken.token)!
  }

  /**
   *
   * Return task status given an Gitlab issue status
   *
   */
  private _getTaskStatusFromGitlabIssue(gitlabStatus: string): TaskStatus {
    const status = gitlabStatus.toLowerCase()
    if (status === 'closed' || status === 'done') {
      return TaskStatus.CLOSED
    }
    return TaskStatus.IN_PROGRESS
  }

  /**
   *
   * Parse Gitlab issue to Task
   *
   */
  private async _parseGitlabIssueToTask(
    issue: GitlabIssue,
    projectId: string
  ): Promise<Partial<Task>> {
    return {
      name: issue.title,
      projectId: projectId,
      status: this._getTaskStatusFromGitlabIssue(issue.state),
      gitlabId: issue.id,
      createdAt: issue.created_at,
      timeEstimated: issue.time_stats.time_estimate,
    }
  }

  /**
   *
   * Update or Create task given a Gitab Issue
   *
   */
  private async _updateOrCreateTaskFromGitlabIssue(issue: GitlabIssue, projectId: string) {
    const searchPayload = { gitlabId: issue.id }
    const persistancePayload = await this._parseGitlabIssueToTask(issue, projectId)
    const taskPayload = await Task.updateOrCreate(searchPayload, persistancePayload)
    return taskPayload
  }

  /**
   *
   * Update project tasks given a list of all project Gitlab issues
   */
  private async _updateProjectTasks({ project, issues }: RefreshProjectTasksRequest) {
    await project.load('tasks')
    // Update or create found tasks.
    issues.forEach(async (issue) => {
      const taskPayload = await this._updateOrCreateTaskFromGitlabIssue(issue, project.id)

      // Assign user to task
      if (issue.assignee) {
        const userToAssign = await User.findBy('gitlabId', issue.assignee.id)
        if (!userToAssign) {
          await IntegrationAssignPendences.create({
            taskId: taskPayload.id,
            gitlabId: issue.assignee.id.toString(),
          })
          return
        }
        await taskPayload.load('usersAssigned')
        if (
          !taskPayload.usersAssigned.map((user) => user.gitlabId).includes(userToAssign.gitlabId)
        ) {
          await taskPayload.related('usersAssigned').attach([userToAssign.id])
        }
      }
    })
    // Check if existing tasks are still in Gitlab project, and if not, delete.
    project.tasks.forEach(async (task) => {
      if (!task.gitlabId) return
      if (!issues.map((issue) => issue.id).includes(task.gitlabId)) {
        await task.delete()
      }
    })
  }

  /**
   *
   * Update project with it's Gitlab data
   *
   */
  public async updateProject(project: Project, token: string): Promise<void> {
    if (!project) return
    if (!project.gitlabId) return

    const issues = await GitlabApiService.getProjectIssues({ id: project.gitlabId, token })

    await this._updateProjectTasks({ project, issues })
  }

  /**
   *
   * Integrate project
   */
  public async importProject({ id, payload, bouncer }: ImportProjectRequest): Promise<void> {
    const { gitlabId } = payload

    const projectIsImported = await Project.findBy('gitlabId', gitlabId)

    if (projectIsImported) {
      throw new Exception('Project is already integrated with Gitlab', 409)
    }

    let project = await Project.find(id)

    if (!project) {
      throw new Exception('Project not found', 404)
    }

    await project.load('organization')

    const organization = project.organization

    await organization.load('gitlabToken')

    if (!organization.gitlabId || !organization.gitlabToken) {
      throw new Exception('Organization is not integrated with Gitlab.', 400)
    }

    await bouncer.authorize('OrganizationManager', organization)

    const token = await this._getOrgToken(project.organizationId)

    project = await project.merge({ gitlabId }).save()

    const webhook = await GitlabApiService.registerProjectWebhook({ id: gitlabId, token })

    await Webhook.create({
      projectId: project.id,
      gitlabId: webhook.id,
      createdAt: webhook.created_at,
    })

    await this.updateProject(project, token)
  }

  /**
   *
   * Update task assignments on webhook
   */
  private async _updateTaskAssignmentsOnWebhook({
    task,
    issueAssignee,
  }: AssignUserFromGitlabToTaskProps) {
    if (!issueAssignee) {
      await task.related('usersAssigned').detach()
      return
    }

    const { id } = issueAssignee

    const user = await User.findBy('gitlabId', id)

    if (!user) {
      return Logger.info('User to assign not found')
    }

    await task.load('usersAssigned')

    if (task.usersAssigned.length) {
      await task.related('usersAssigned').detach([task.usersAssigned[0].id])
    }

    await task.related('usersAssigned').attach([user.id])
  }

  /**
   *
   * Parse Gitlab issue from webhook to Task
   *
   */
  private async _parseGitlabIssueFromWebhookToTask(
    issue: GitlabIssueFromWebhook,
    projectId: string
  ): Promise<Partial<Task>> {
    const project = await Project.findBy('gitlabId', issue.project_id)
    if (!project) {
      throw new Exception('Project not found', 404)
    }
    return {
      name: issue.title,
      projectId,
      status: this._getTaskStatusFromGitlabIssue(issue.state),
      gitlabId: issue.id,
      createdAt: issue.created_at,
      timeEstimated: issue.time_estimate,
    }
  }

  /**
   *
   * Update or Create task given a Gitlab Issue from Webhook
   *
   */
  private async _updateOrCreateTaskFromGitlabIssueOnWebhook(
    issue: GitlabIssueFromWebhook,
    projectId: string
  ) {
    const searchPayload = { gitlabId: issue.id }
    const persistancePayload = await this._parseGitlabIssueFromWebhookToTask(issue, projectId)
    const taskPayload = await Task.updateOrCreate(searchPayload, persistancePayload)
    return taskPayload
  }

  /**
   *
   * Create or update task by webhook
   *
   */
  public async createOrUpdateIssueByWebHook(issue: GitlabIssueFromWebhook) {
    const project = await Project.findBy('gitlabId', issue.project_id)

    if (!project) {
      return Logger.info('Project not found')
    }

    const taskPayload = await this._updateOrCreateTaskFromGitlabIssueOnWebhook(issue, project.id)

    await this._updateTaskAssignmentsOnWebhook({
      task: taskPayload,
      issueAssignee: { id: issue.assignee_id },
    })
  }

  public async deleteProjectWebhooks(project: Project) {
    const token = await this._getOrgToken(project.organizationId)

    const webhooks = await Webhook.query().where('projectId', project.id)

    const webhookIds = webhooks.map((webhook) => webhook.gitlabId)

    webhookIds.forEach(async (hookId) => {
      await GitlabApiService.deleteWebhook({ hookId, projectId: project.gitlabId!, token })
    })

    await Webhook.query().where('projectId', project.id).delete()
  }
}

export default new GitlabIntegrationService()
