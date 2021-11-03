import User from 'App/Models/User'
import GitlabClientService from './GitlabClientService'
import Logger from '@ioc:Adonis/Core/Logger'
import Project from 'App/Models/Project'
import Task from 'App/Models/Task'
import { AccessLevelProps } from 'App/Interfaces/IGitlabUser'
import { IgitlabProject } from 'App/Interfaces/IGitlabProject'
import { Exception } from '@poppinss/utils'

type ImportProjectProps = {
  project: IgitlabProject
  organizationId: string
  token?: string
}

export default class IntegrateGitlabProjectService {
  private _gitlabClientService: GitlabClientService
  private _logger: typeof Logger

  constructor() {
    this._gitlabClientService = new GitlabClientService()
    this._logger = Logger
  }

  private getUserRole(access_level: AccessLevelProps) {
    switch (access_level) {
      case 0:
        return 'PV'
      case 5:
        return 'PV'
      case 10:
        return 'PV'
      case 20:
        return 'U'
      case 30:
        return 'U'
      case 40:
        return 'PM'
      case 50:
        return 'PM'
    }
  }

  private async importProjectUsers(project: Project) {
    // Find project Users and assign them
    const users = await this._gitlabClientService.getProjectUsers(
      project.gitlabId!,
      'kFkzRgKKTor5ZSsp3zse'
    )

    users.forEach(async (user) => {
      const existingUser = await User.findBy('gitlabId', user.id)
      if (!existingUser) {
        return this._logger.warn(`Could not find User '${user.name}' on import.`)
      }
      await project.related('usersAssigned').attach({
        [existingUser.id]: {
          user_role: this.getUserRole(user.access_level),
        },
      })
    })
  }

  private async importProjectTasks(project: Project) {
    const tasks = await this._gitlabClientService.getProjectTasks(
      project.gitlabId!,
      'kFkzRgKKTor5ZSsp3zse'
    )

    tasks.forEach(async (task) => {
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
          return this._logger.warn(
            `Attempt to assign user ${assignee.name} to task ${task.title} failed, because User doesn't exists or is not connected with Gitlab Account`
          )
        }
        await newTask.related('usersAssigned').attach([userToAssign.id])
      })
    })
  }

  public async import(data: ImportProjectProps) {
    const { project, organizationId } = data

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

    await this.importProjectUsers(newProject)

    await this.importProjectTasks(newProject)
  }
}
