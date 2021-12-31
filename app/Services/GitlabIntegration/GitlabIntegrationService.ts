import { Exception } from '@adonisjs/core/build/standalone'
import {
  RefreshProjectTasksRequest,
  RefreshProjectUsersRequest,
  UpdateTokenRequest,
  ValidateTokenRequest,
} from 'App/Interfaces/Gitlab/gitlab-api-service.interfaces'
import GitlabToken from 'App/Models/GitlabToken'
import Organization from 'App/Models/Organization'
import Project from 'App/Models/Project'
import Task from 'App/Models/Task'
import User from 'App/Models/User'
import Logger from '@ioc:Adonis/Core/Logger'
import GitlabApiService from './GitlabApiService'
import { GitlabAccessLevels } from 'Contracts/enums/gitlab-access-levels'
import {
  ImportOrganizationRequest,
  ImportProjectRequest,
  ImportUserRequest,
} from 'App/Interfaces/Gitlab/gitlab-integration-service.interfaces'
import Encryption from '@ioc:Adonis/Core/Encryption'

class GitlabIntegrationService {
  public async importOrganization({ payload, bouncer }: ImportOrganizationRequest): Promise<void> {
    const { organizationId, gitlabId, token } = payload

    const organization = await Organization.find(organizationId)

    if (!organization) {
      throw new Exception('Organization not found.', 404)
    }

    await bouncer.authorize('OrganizationCreator', organization)

    await organization.merge({ gitlabId }).save()

    await GitlabToken.create({
      ownerId: organization!.creatorId,
      organizationId,
      token: token.access_token,
      refreshToken: token.refresh_token,
      expiresIn: token.expires_in,
      createdTime: token.created_at,
    })
  }

  private _validateToken({ expiresIn, createdAt }: ValidateTokenRequest) {
    const expirationTime = (createdAt + expiresIn) * 1000
    const currentTime = new Date().getTime()

    return currentTime < expirationTime
  }

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

  private async _getOrgToken(organizationId: string): Promise<string> {
    const organization = await Organization.find(organizationId)

    if (!organization) {
      throw new Exception('Organization not found.', 404)
    }

    await organization.load('gitlabToken')

    if (!organization.gitlabId || !organization.gitlabToken) {
      throw new Exception('Organization is not integrated with Gitlab.', 400)
    }

    const tokenIsValid = this._validateToken({
      expiresIn: organization.gitlabToken.expiresIn,
      createdAt: organization.gitlabToken.createdTime,
    })

    if (!tokenIsValid) {
      const updatedToken = await this._updateToken({ existingToken: organization.gitlabToken })
      return Encryption.decrypt(updatedToken.token)!
    }

    return Encryption.decrypt(organization.gitlabToken.token)!
  }

  protected getUserRole(access_level: GitlabAccessLevels) {
    switch (access_level) {
      case GitlabAccessLevels.NO_ACCESS:
        return 'PV'
      case GitlabAccessLevels.MINIMAL_ACCESS:
        return 'PV'
      case GitlabAccessLevels.GUEST:
        return 'PV'
      case GitlabAccessLevels.REPORTER:
        return 'U'
      case GitlabAccessLevels.DEVELOPER:
        return 'U'
      case GitlabAccessLevels.MAINTANER:
        return 'PM'
      case GitlabAccessLevels.OWNER:
        return 'PM'
    }
  }

  private async _updateProjectUsers({ project, users }: RefreshProjectUsersRequest): Promise<void> {
    await project.load('usersAssigned')
    users.forEach(async (user) => {
      const existingUser = await User.findBy('gitlabId', user.id)
      if (!existingUser) return

      if (
        !project.usersAssigned
          .map((userAssigned) => userAssigned.gitlabId)
          .includes(existingUser.gitlabId)
      ) {
        const role = this.getUserRole(user.access_level)
        await project.related('usersAssigned').attach({ [existingUser.id]: { role } })
      }
    })

    project.usersAssigned.forEach(async (userAssigned) => {
      if (!users.map((user) => user.id).includes(userAssigned.gitlabId)) {
        await project.related('usersAssigned').detach([userAssigned.id])
      }
    })
  }

  private async _updateProjectTasks({ project, tasks }: RefreshProjectTasksRequest) {
    await project.load('tasks')

    // Check if there's any task that is not imported, and if so, import.
    tasks.forEach(async (task) => {
      if (!project.tasks.map((existingTask) => existingTask.gitlabId).includes(task.id)) {
        const newTask = await Task.create({
          name: task.title,
          body: task.description,
          timeEstimated: task.time_stats.time_estimate,
          gitlabCreatorId: task.author.id,
          projectId: project.id,
          gitlabId: task.id,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
        })

        task.assignees.forEach(async (assignee) => {
          const userToAssign = await User.findBy('gitlabId', assignee.id)
          if (!userToAssign) {
            return Logger.warn(
              `Attempt to assign user ${assignee.name} to task ${task.title} failed, because User doesn't exists or is not connected with Gitlab Account`
            )
          }
          await newTask.related('usersAssigned').attach([userToAssign.id])
        })
      }
    })

    // Check if existing tasks are still in Gitlab project, and if not, delete.
    project.tasks.forEach(async (existingTask) => {
      if (!existingTask.gitlabId) return
      if (!tasks.map((task) => task.id).includes(existingTask.gitlabId)) {
        await existingTask.delete()
      }
    })
  }

  public async updateProject(project: Project): Promise<void> {
    if (!project) return
    if (!project.gitlabId) return

    const token = await this._getOrgToken(project.organizationId)

    const users = await GitlabApiService.getProjectUsers({ id: project.gitlabId, token })
    const tasks = await GitlabApiService.getProjectTasks({ id: project.gitlabId, token })

    await this._updateProjectUsers({ project, users })
    await this._updateProjectTasks({ project, tasks })
  }

  public async importProject(payload: ImportProjectRequest): Promise<void> {
    const { project, organizationId } = payload

    const projectExists = await Project.findBy('gitlabId', project.id)

    if (projectExists) throw new Exception('Project is already imported', 409)

    const newProject = await Project.create({
      name: project.name,
      description: project.description ? project.description : '',
      gitlabAvatarUrl: project.avatar_url ? project.avatar_url : '',
      gitlabId: project.id,
      gitlabCreatorId: project.creator_id,
      organizationId,
    })

    await this.updateProject(newProject)
  }

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
  }

  private async _getUserToken(user?: User): Promise<string> {
    if (!user) {
      throw new Exception('User not found.', 400)
    }

    await user.load('gitlabToken')

    if (!user.gitlabId || !user.gitlabToken) {
      throw new Exception('User is not integrated with Gitlab.', 400)
    }

    const tokenIsValid = this._validateToken({
      expiresIn: user.gitlabToken.expiresIn,
      createdAt: user.gitlabToken.createdTime,
    })

    if (!tokenIsValid) {
      const updatedToken = await this._updateToken({ existingToken: user.gitlabToken })
      return Encryption.decrypt(updatedToken.token)!
    }

    return Encryption.decrypt(user.gitlabToken.token)!
  }

  public async updateUser(user?: User): Promise<void> {
    if (!user) {
      throw new Exception('User not found.', 404)
    }

    const token = await this._getUserToken(user)

    const userGitlabOrganizations = await GitlabApiService.getUserOrganizations({ token })

    //Update Organizations
    userGitlabOrganizations.forEach(async (org) => {
      const organization = await Organization.findBy('gitlabId', org.id)

      if (!organization) return

      await organization.load('members')

      if (organization.members.map((member) => member.id).includes(user.id)) return

      await organization.related('members').attach([user.id])
    })

    // Update Projects
    const userGitlabProjects = await GitlabApiService.getUserProjects({ token })

    userGitlabProjects.forEach(async (pr) => {
      const project = await Project.findBy('gitlabId', pr.id)

      if (!project) return

      await project.load('usersAssigned')

      if (project.usersAssigned.map((u) => u.id).includes(user.id)) return

      const userAccessLevel = pr.permissions!.project_access
        ? pr.permissions!.project_access.access_level
        : pr.permissions!.group_access!.access_level

      const role = this.getUserRole(userAccessLevel)

      await project.related('usersAssigned').attach({ [user.id]: { role } })

      const tasks = await GitlabApiService.getProjectTasks({ id: project.gitlabId, token })

      await this._updateProjectTasks({ project, tasks })
    })
  }
}

export default new GitlabIntegrationService()
