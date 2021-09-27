import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/User/CreateUserValidator'
import UsersExceptions from 'App/Exceptions/CustomExceptionsHandlers/UsersExceptions'
import { LogCreated, LogDeleted, LogList, LogShow, LogUpdated } from 'App/Helpers/CustomLogs'
import UpdateUserValidator from 'App/Validators/User/UpdateUserValidator'

export default class UsersController {
  public async list({ response }: HttpContextContract) {
    const users = await User.all()

    LogList(users)

    response.json(users.map((user) => user.serialize()))
  }

  public async show({ request, response }: HttpContextContract) {
    const id = request.param('id')

    const user = await User.findOrFail(id)

    UsersExceptions.CheckIfUserExists(user)

    LogShow(user)

    response.json(user.serialize())
  }

  public async create({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateUserValidator)

    await UsersExceptions.CheckIfEmailExists(payload.email)

    const user = await User.create(payload)

    LogCreated(user)

    response.status(201).json(user.serialize())
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = request.param('id')

    const user = await User.findOrFail(id)

    await bouncer.authorize('editAndDeleteUser', id)
    const payload = await request.validate(UpdateUserValidator)

    if (payload.email) {
      await UsersExceptions.CheckIfEmailIsDifferentOnUpdate(payload.email, id)
      await UsersExceptions.CheckIfEmailExistsOnUpdate(payload.email, id)
    }

    UsersExceptions.CheckIfUserExists(user)

    await user.merge(payload).save()

    LogUpdated(user)

    response.json(user.serialize())
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = request.param('id')

    const user = await User.findOrFail(id)

    await bouncer.authorize('editAndDeleteUser', id)

    UsersExceptions.CheckIfUserExists(user)

    LogDeleted(user)

    await user.delete()

    response.status(204)
  }
}
