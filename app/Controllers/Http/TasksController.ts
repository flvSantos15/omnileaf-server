import TaskService from 'App/Services/Task/TaskService'
import Logger from '@ioc:Adonis/Core/Logger'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AssignUserToTaskValidator from 'App/Validators/Task/AssignUserValidator'
import CreateTaskValidator from 'App/Validators/Task/CreateTaskValidator'
import UnssignUserToTaskValidator from 'App/Validators/Task/UnssignUserValidator'
import UpdateTaskValidator from 'App/Validators/Task/UpdateTaskValidator'
import UuidValidator from 'App/Validators/Global/UuidValidator'

export default class TasksController {
  public async list({ response }: HttpContextContract) {
    const tasks = TaskService.getAll()

    Logger.info('Successfully retrieved tasks list')

    response.send(tasks)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const task = await TaskService.getOne(id)

    Logger.info('Succesfully retrieved task')

    response.send(task)
  }

  // to-do, insert tags on create ?
  public async create({ request, response, bouncer, auth }: HttpContextContract) {
    const payload = await request.validate(CreateTaskValidator)

    const task = await TaskService.register({ payload, auth, bouncer })

    Logger.info('Succesfully created task')

    response.status(201).send(task)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(UpdateTaskValidator)

    const task = await TaskService.update({ id, payload, bouncer })

    Logger.info('Succesfullt updated task')

    response.send(task)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    await TaskService.delete({ id, bouncer })

    Logger.info('Succesfully deleted task')

    response.status(204)
  }

  public async assignUser({ request, response, bouncer }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(AssignUserToTaskValidator)

    await TaskService.assignUser({ id, payload, bouncer })

    Logger.info('Succesfully assigned user to task')

    response.status(204)
  }

  public async unssignUser({ request, response, bouncer }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(UnssignUserToTaskValidator)

    await TaskService.unsignUser({ id, payload, bouncer })

    Logger.info('Succesfully unsigned user from task')

    response.status(204)
  }
}
