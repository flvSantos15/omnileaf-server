import { Exception } from '@adonisjs/core/build/standalone'
import {
  AssignUserRequest,
  DeleteTaskRequest,
  RegisterTaskRequest,
  UpdateTaskRequest,
} from 'App/Interfaces/Task/task-service.interfaces'
import Project from 'App/Models/Project'
import Task from 'App/Models/Task'
import { UnsignUserRequest } from '../../Interfaces/Task/task-service.interfaces'

class TaskService {
  public async getAll() {
    const tasks = await Task.all()

    return tasks
  }

  public async getOne(id: string) {
    const task = await Task.find(id)

    if (!task) {
      throw new Exception('Task not found', 404)
    }

    await task.load('trackingSessions')

    const totalTracked = task.trackingSessions
      .map((session) => session.trackingTime)
      .reduce((acc, val) => acc + val, 0)

    return { ...task.serialize(), totalTracked }
  }

  public async register({ payload, bouncer, auth }: RegisterTaskRequest) {
    const user = auth.use('web').user!
    const project = await Project.find(payload.projectId)

    if (!project) {
      throw new Exception('Project not found', 404)
    }

    await bouncer.authorize('ProjectManager', project)

    const task = await Task.create({ ...payload, creatorId: user.id })

    return task
  }

  public async update({ id, payload, bouncer }: UpdateTaskRequest) {
    const task = await Task.find(id)

    if (!task) {
      throw new Exception('Task not found', 404)
    }

    await task.load('project')
    await bouncer.authorize('ProjectManager', task.project)

    await task.merge(payload).save()

    return task
  }

  public async delete({ id, bouncer }: DeleteTaskRequest) {
    const task = await Task.find(id)

    if (!task) {
      throw new Exception('Task not found', 404)
    }

    await task.load('project')

    await bouncer.authorize('ProjectManager', task.project)

    await task.merge({ isDeleted: true }).save()
  }

  public async assignUser({ id, payload, bouncer }: AssignUserRequest) {
    const { userId } = payload
    const task = await Task.find(id)

    if (!task) {
      throw new Exception('Task not found', 404)
    }

    await task.load('project')
    bouncer.authorize('ProjectManager', task.project)

    await task.load('usersAssigned')

    if (task.usersAssigned.map((user) => user.id).includes(userId)) {
      throw new Exception('User is already assigned', 400)
    }

    await task.related('usersAssigned').attach([userId])
  }

  public async unsignUser({ id, payload, bouncer }: UnsignUserRequest) {
    const { userId } = payload
    const task = await Task.find(id)

    if (!task) {
      throw new Exception('Task not found', 404)
    }

    await task.load('project')
    bouncer.authorize('ProjectManager', task.project)

    await task.related('usersAssigned').detach([userId])
  }
}

export default new TaskService()
