import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  LogCreated,
  LogList,
  LogShow,
  LogUpdated,
  LogDeleted,
  LogAttached,
  LogDettached,
} from 'App/Helpers/CustomLogs'
import { LoadTaskRelations } from 'App/Helpers/RelationsLoaders/TaskRelationLoaders'
import Task from 'App/Models/Task'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import { ValidateAssignUserToTask } from 'App/Validators/Task/AssignUserValidator'
import { ValidateCreateTask } from 'App/Validators/Task/CreateTaskValidator'
import { ValidateUnssignUserToTask } from 'App/Validators/Task/UnssignUserValidator'
import { ValidateUpdateTask } from 'App/Validators/Task/UpdateTaskValidator'

export default class TasksController {
  public async list({ response }: HttpContextContract) {
    const tasks = await Task.all()

    LogList(tasks)

    response.send(tasks)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const task = await LoadTaskRelations(id, request.qs())

    LogShow(task)

    response.send(task)
  }

  // to-do, insert tags on create ?
  public async create({ request, response, bouncer, auth }: HttpContextContract) {
    const { payload, project } = await ValidateCreateTask(request)

    const user = auth.use('web').user!

    await bouncer.authorize('ProjectManager', project)

    const task = await Task.create({ ...payload, creatorId: user.id })

    LogCreated(task)

    response.status(201).send(task)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const payload = await ValidateUpdateTask(request)

    const task = await Task.findOrFail(id)

    // Authorize project Manager
    await task.load('project')
    bouncer.authorize('ProjectManager', task.project)

    await task.merge(payload).save()

    LogUpdated(task)

    response.send(task)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const task = await Task.findOrFail(id)

    // Authorize project Manager
    await task.load('project')
    bouncer.authorize('ProjectManager', task.project)

    LogDeleted(task)

    await task.delete()

    response.status(204)
  }

  public async assignUser({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const task = await Task.findOrFail(id)

    const { userId } = await ValidateAssignUserToTask(id, request)

    // Authorize project Manager
    await task.load('project')
    bouncer.authorize('ProjectManager', task.project)

    await task.related('usersAssigned').attach([userId])

    LogAttached()

    response.status(204)
  }

  public async unssignUser({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const task = await Task.findOrFail(id)

    const { userId } = await ValidateUnssignUserToTask(id, request)

    // Authorize project Manager
    await task.load('project')
    bouncer.authorize('ProjectManager', task.project)

    await task.related('usersAssigned').detach([userId])

    LogDettached()

    response.status(204)
  }
}
