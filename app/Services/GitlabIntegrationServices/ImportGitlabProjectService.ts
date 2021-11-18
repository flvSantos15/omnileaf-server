import User from 'App/Models/User'
import GitlabHttpClientService from './GitlabHttpClientService'
import Logger from '@ioc:Adonis/Core/Logger'
import Project from 'App/Models/Project'
import Task from 'App/Models/Task'
import { AccessLevelProps, IGitlabUser } from 'App/Interfaces/IGitlabUser'
import { IGitlabProject } from 'App/Interfaces/IGitlabProject'
import { Exception } from '@poppinss/utils'
import { IGitlabTask } from 'App/Interfaces/IGitlabTask'

interface IImportProjectProps {
  project: IGitlabProject
  organizationId: string
  token: string
}

interface IImportProjectUserProps {
  users: IGitlabUser[]
  project: Project
}

interface IImportProjectTaskProps {
  tasks: IGitlabTask[]
  project: Project
}

export default class ImportGitlabProjectService {
  // For this Service on constructor, we should get the organization Id to get
  // it's token.
  constructor() {}

  private _getUserRole(access_level: AccessLevelProps) {
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

  private async importProjectUsers({ users, project }: IImportProjectUserProps) {
    // Find project Users and assign them
    // const users = await this._gitlabHttpClientService.getProjectUsers(project.gitlabId!)

    users.forEach(async (user) => {
      const existingUser = await User.findBy('gitlabId', user.id)
      if (!existingUser) {
        return Logger.warn(`Could not find User '${user.name}' on import.`)
      }

      const userRole = this._getUserRole(user.access_level)
      await project.related('usersAssigned').attach({ [existingUser.id]: { role: userRole } })
    })
  }

  private async importProjectTasks({ tasks, project }: IImportProjectTaskProps) {
    // const tasks = await this._gitlabHttpClientService.getProjectTasks(project.gitlabId!)

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
          return Logger.warn(
            `Attempt to assign user ${assignee.name} to task ${task.title} failed, because User doesn't exists or is not connected with Gitlab Account`
          )
        }
        await newTask.related('usersAssigned').attach([userToAssign.id])
      })
    })
  }

  public async execute(payload: IImportProjectProps) {
    const gitlabHttpClient = new GitlabHttpClientService()

    const { project, organizationId, token } = payload

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

    const users = await gitlabHttpClient.getProjectUsers({ id: newProject.gitlabId!, token })
    const tasks = await gitlabHttpClient.getProjectTasks({ id: newProject.gitlabId!, token })

    await this.importProjectUsers({ users, project: newProject })

    await this.importProjectTasks({ tasks, project: newProject })
  }
}
