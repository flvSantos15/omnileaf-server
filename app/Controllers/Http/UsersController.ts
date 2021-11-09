import User from 'App/Models/User'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForgotPassworValidator from 'App/Validators/User/ForgotPasswordValidator'
import { LogDeleted, LogUpdated } from 'App/Helpers/CustomLogs'
import ListUsersService from 'App/Services/UserServices/ListUsersService'
import ShowUserService from 'App/Services/UserServices/ShowUserService'
import CreateUserService from 'App/Services/UserServices/CreateUserService'
import CreateUserValidator from 'App/Validators/User/CreateUserValidator'
import ResetPasswordValidator from 'App/Validators/User/ResetPasswordValidator'

import { validateIdParam, validateIdParamV1 } from 'App/Validators/Global/IdParamValidator'
import UpdateUserService from 'App/Services/UserServices/UpdateUserService'
import DeleteUserService from 'App/Services/UserServices/DeleteUserService'
import ForgotPasswordService from 'App/Services/UserServices/ForgotPasswordService'
import ResetPasswordService from 'App/Services/UserServices/ResetPasswordService'

export default class UsersController {
  public async list({ response }: HttpContextContract) {
    const listUsers = new ListUsersService()

    const users = await listUsers.execute()

    response.json(users)
  }

  public async show({ request, response }: HttpContextContract) {
    const showUser = new ShowUserService()

    const id = validateIdParam(request.param('id'))

    const user = await showUser.execute({ id })

    response.json(user)
  }

  public async create({ request, response }: HttpContextContract) {
    const createUser = new CreateUserService()

    const payload = await request.validate(CreateUserValidator)

    const user = await createUser.execute({ payload })

    response.status(201).send(user)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const updateUser = new UpdateUserService()

    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(CreateUserValidator)

    const user = await updateUser.execute({ id, payload, bouncer })

    response.json(user)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const deleteUser = new DeleteUserService()

    const id = validateIdParam(request.param('id'))

    await deleteUser.execute({ id, bouncer })

    response.status(204)
  }

  public async forgotPassword({ request, response }: HttpContextContract) {
    const forgotPasswordService = new ForgotPasswordService()

    const payload = await request.validate(ForgotPassworValidator)

    const token = await forgotPasswordService.execute({ payload })

    response.send(token)
  }

  public async resetPassword({ request, response, auth }: HttpContextContract) {
    const resetPasswordService = new ResetPasswordService()

    const id = validateIdParamV1(request.param('tokenId'))

    const payload = await request.validate(ResetPasswordValidator)

    await resetPasswordService.execute({ id, payload, auth })

    response.redirect('/')
  }
}
