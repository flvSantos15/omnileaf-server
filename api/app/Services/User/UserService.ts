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

class UserService {
  public async getAll(): Promise<ModelObject[]> {
    const users = await User.all()

    const usersSerialized = users.map((user) => user.serialize())

    return usersSerialized
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

    return user
  }

  public async getUserOrganizations({ id, params }: GetUserRequest) {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User Id does not exists.', 404)
    }

    if (params.labels) {
      await user.load('organizations', (organizationsQuery) => {
        organizationsQuery.preload('memberRelations', (relationsQuery) => {
          relationsQuery.where('user_id', user.id).preload('labels', (labelsQuery) => {
            labelsQuery.select('title')
          })
        })
      })

      return user
    }
    await user.load('organizations')

    return user
  }

  public async getUserProjects({ id, params }: GetUserRequest) {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User not found', 404)
    }

    if (params.trackingSessions) {
      await user.load('assignedProjects', (projectsQuery) => {
        projectsQuery.where('isDeleted', false).preload('tasks', (tasksQuery) => {
          tasksQuery.where('isDeleted', false).preload('trackingSessions')
        })
      })

      return user.serialize()
    }

    await user.load('assignedProjects', (projectsQuery) => {
      projectsQuery.where('isDeleted', false).preload('tasks', (tasksQuery) => {
        tasksQuery.where('isDeleted', false)
      })
    })

    return user.serialize()
  }

  public async getUserTasks({ id, params }: GetUserRequest) {
    const user = await User.find(id)

    if (!user) {
      throw new Exception('User not found', 404)
    }

    if (params.screenshots) {
      await user.load('assignedTasks', (tasksQuery) => {
        tasksQuery.where('isDeleted', false).preload('trackingSessions', (sessionsQuery) => {
          sessionsQuery.preload('screenshots')
        })
      })

      return user.serialize()
    }

    await user.load('assignedTasks', (tasksQuery) => {
      tasksQuery.where('isDeleted', false).preload('trackingSessions')
    })

    return user.serialize()
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
