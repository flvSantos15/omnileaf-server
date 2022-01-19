import User from 'App/Models/User'
import { Exception } from '@adonisjs/core/build/standalone'
import {
  DeleteUserRequest,
  EditGitlabIdRequest,
  RegisterUserResquest,
  GetUserRequest,
  UpdateUserRequest,
} from '../../Interfaces/User/user-service.interfaces'
import { ModelObject } from '@ioc:Adonis/Lucid/Orm'
import CustomHelpers from '@ioc:Omnileaf/CustomHelpers'
import UserServiceExtension from 'App/Extensions/UserServiceExtension'

class UserService extends UserServiceExtension {
  public async getAll(): Promise<ModelObject[]> {
    const users = await User.all()

    return users.map((user) => user.serialize())
  }

  public async getOne({ id, params }: GetUserRequest): Promise<ModelObject> {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    if (params!.assignedProjects) {
      await user.load('assignedProjects', (projectsQuery) => {
        projectsQuery.where('isDeleted', false).preload('tasks')
      })
    }

    if (params!.assignedTasks) {
      await user.load('assignedTasks', (projectsQuery) => {
        projectsQuery.where('isDeleted', false).preload('trackingSessions')
      })
    }

    if (params!.screenshots) {
      await user.load('screenshots')
    }

    return user.serialize()
  }

  public async getUserOrganizations({ id }: GetUserRequest) {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    const organizations = await user
      .related('organizations')
      .query()
      .preload('memberRelations', (relationsQuery) => {
        relationsQuery.where('user_id', user.id).preload('labels', (labelsQuery) => {
          labelsQuery.select('title')
        })
      })

    return organizations.map((organization) => organization.serialize())
  }

  public async getUserProjects({ id, params }: GetUserRequest) {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User not found', 404)
    }

    const projects = await user
      .related('assignedProjects')
      .query()
      .preload('tasks', (tasksQuery) => {
        tasksQuery.whereIn('id', (query) => {
          query.from('task_user').select('task_id').where('user_id', user.id)
        })

        if (params.trackingSessions) {
          tasksQuery.preload('trackingSessions')
        }
      })

    return projects.map((projetc) => projetc.serialize())
  }

  public async getProjectsWithDailyTrack(id: string) {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User not found', 404)
    }

    const today = new Date()
    const todayAsDateTime = CustomHelpers.dateAsDateTime(today)
    const todayAsDateTimePluOne = todayAsDateTime.plus({ days: 1 })

    const projects = await user
      .related('assignedProjects')
      .query()
      .preload('tasks', (tasksQuery) => {
        tasksQuery.whereIn('id', (query) => {
          query.from('task_user').select('task_id').where('user_id', user.id)
          tasksQuery.preload('trackingSessions', (sessionsQuery) => {
            sessionsQuery
              .whereBetween('started_at', [
                todayAsDateTime.toSQLDate(),
                todayAsDateTimePluOne.toSQLDate(),
              ])
              .preload('task')
          })
        })
      })

    return this._summarizeProjectsDailyTrack(projects)
  }

  public async getUserTasks({ id, params }: GetUserRequest) {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User not found', 404)
    }

    const tasks = await user
      .related('assignedTasks')
      .query()
      .preload('trackingSessions', (sessionsQuery) => {
        if (params.screenshots) {
          sessionsQuery.preload('screenshots')
        }
      })

    return tasks.map((task) => task.serialize())
  }

  public async register({ payload }: RegisterUserResquest): Promise<ModelObject> {
    const { email } = payload

    if (await User.findBy('email', email)) {
      throw new Exception('Email is already registered.', 409)
    }

    const user = await User.create(payload)

    return user.serialize()
  }

  public async update({ id, payload, bouncer }: UpdateUserRequest): Promise<ModelObject> {
    const { email } = payload
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    if (email) {
      const emailExists = await User.query().where('email', email).andWhereNot('id', user.id)
      if (emailExists.length) {
        throw new Exception('Email is already registered for another user.', 409)
      }
    }

    await bouncer.authorize('OwnUser', id)

    await user.merge(payload).save()

    return user!.serialize()
  }

  public async delete({ id, bouncer }: DeleteUserRequest): Promise<void> {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    await bouncer.authorize('OwnUser', id)

    await user.delete()
  }

  public async editGitalbId({ id, payload, bouncer }: EditGitlabIdRequest) {
    const { gitlabId } = payload
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User not found.', 404)
    }

    bouncer.authorize('OwnUser', user.id)

    user.gitlabId = gitlabId
    await user.save()

    return user
  }
}

export default new UserService()
