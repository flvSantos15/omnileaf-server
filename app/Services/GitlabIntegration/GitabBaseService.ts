import Env from '@ioc:Adonis/Core/Env'
import axios, { AxiosInstance } from 'axios'
import { Exception } from '@adonisjs/core/build/standalone'
import GitlabToken from 'App/Models/GitlabToken'
import Organization from 'App/Models/Organization'
import { GitlabAccessLevels } from 'Contracts/enums/gitlab-access-levels'
import Project from 'App/Models/Project'
import User from 'App/Models/User'
import Task from 'App/Models/Task'
import Logger from '@ioc:Adonis/Core/Logger'
import { IGitlabUser } from 'App/Interfaces/Gitlab/gitlab-user.interface'
import { IGitlabTask } from 'App/Interfaces/Gitlab/gitlab-task.interface'
import { IGitlabOrganization } from 'App/Interfaces/Gitlab/gitlab-organization'
import { IGitlabProject } from 'App/Interfaces/Gitlab/gitlab-project.interface'

interface IRefreshToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
  created_at: number
}

export interface IApiRequest {
  id?: number
  token?: string
}

interface IValidateToken {
  expiresIn: number
  createdAt: number
}

interface IUpdateToken {
  existingToken: GitlabToken
}

type RefreshProjectUsersProps = {
  project: Project
  users: IGitlabUser[]
}

type RefreshProjectTasksProps = {
  project: Project
  tasks: IGitlabTask[]
}

export default class GitlabBaseService {
  protected client: AxiosInstance

  constructor() {
    this.client = axios.create({ baseURL: 'https://gitlab.com/api/v4' })
  }

  protected async getProjectUsers({ id, token }: IApiRequest): Promise<IGitlabUser[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/projects/${id}/members`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }

  protected async getProjectTasks({ id, token }: IApiRequest): Promise<IGitlabTask[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/projects/${id}/issues`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }

  //TO-DO: Validates if is necessary
  protected async getUserOrganizations({ token }: IApiRequest): Promise<IGitlabOrganization[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/groups`,
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  }

  //TO-DO: Validates if is necessary
  protected async getUserProjects({ token }: IApiRequest): Promise<IGitlabProject[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/projects`,
      headers: { Authorization: `Bearer ${token}` },
      params: {
        membership: true,
      },
    })
    return data
  }

  //TO-DO: Validates if is necessary
  protected async getUserTasks({ token }: IApiRequest): Promise<IGitlabTask[]> {
    const { data } = await this.client({
      method: 'GET',
      url: `/projects`,
      headers: { Authorization: `Bearer ${token}` },
      params: {
        membership: true,
      },
    })
    return data
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

  protected async updateProjectUsers({ project, users }: RefreshProjectUsersProps): Promise<void> {
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

  protected async updateProjectTasks({ project, tasks }: RefreshProjectTasksProps) {
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

  private async _requestNewToken(refreshToken: string): Promise<IRefreshToken> {
    const { data }: { data: IRefreshToken } = await axios({
      method: 'POST',
      url: 'https://gitlab.com/oauth/token',
      params: {
        client_id: `${Env.get('GITLAB_APP_ID')}`,
        client_secret: `${Env.get('GITLAB_APP_SECRET')}`,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        redirect_uri: 'http://localhost:3333',
        code_verifier: `${Env.get('GITLAB_CODE_VERIFIER')}`,
      },
    })

    return data
  }

  private _validateToken({ expiresIn, createdAt }: IValidateToken) {
    const expirationTime = (createdAt + expiresIn) * 1000
    const currentTime = new Date().getTime()

    return currentTime < expirationTime
  }

  private async _updateToken({ existingToken }: IUpdateToken) {
    const token = await this._requestNewToken(existingToken.refreshToken)

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

  protected async getOrgToken(organizationId: string): Promise<string> {
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
      return updatedToken.token
    }

    return organization.gitlabToken.token
  }

  protected async getUserToken(user?: User): Promise<string> {
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
      return updatedToken.token
    }

    return user.gitlabToken.token
  }
}
