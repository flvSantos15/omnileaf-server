import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateUserValidator from 'App/Validators/User/CreateUserValidator'
import ForgotPassworValidator from 'App/Validators/User/ForgotPasswordValidator'
import ResetPasswordValidator from 'App/Validators/User/ResetPasswordValidator'
import PatchGitlabIdValidator from 'App/Validators/User/PatchGitlabIdValidator'
import Logger from '@ioc:Adonis/Core/Logger'
import UserService from 'App/Services/User/UserService'
import UserPasswordService from 'App/Services/User/UserPasswordService'
import UuidValidator from 'App/Validators/Global/UuidValidator'

export default class UsersController {
  public async list({ response }: HttpContextContract) {
    const users = await UserService.getAll()

    response.json(users)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const user = await UserService.getOne({ id, params: request.qs() })

    response.json(user)
  }

  public async showUserOrganizations({ request, response }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const user = await UserService.getUserOrganizations({ id, params: request.qs() })

    response.json(user)
  }

  public async showUserProjects({ request, response }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const user = await UserService.getUserProjects({ id, params: request.qs() })

    response.json(user)
  }

  public async showUserTasks({ request, response }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const user = await UserService.getUserTasks({ id, params: request.qs() })

    response.json(user)
  }

  public async create({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateUserValidator)

    const user = await UserService.register({ payload })

    Logger.info('User created succesfully.')

    response.status(201).send(user)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(CreateUserValidator)

    const user = await UserService.update({ id, payload, bouncer })

    response.json(user)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    await UserService.delete({ id, bouncer })

    response.status(204)
  }

  public async forgotPassword({ request, response }: HttpContextContract) {
    const payload = await request.validate(ForgotPassworValidator)

    const token = await UserPasswordService.forgotPassword({ payload })

    response.send(token)
  }

  public async resetPassword({ request, response, auth }: HttpContextContract) {
    const id = UuidValidator.v1(request.param('tokenId'))

    const payload = await request.validate(ResetPasswordValidator)

    await UserPasswordService.resetPassword({ id, payload, auth })

    response.redirect('/')
  }

  public async editGitlabId({ request, response, bouncer, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(PatchGitlabIdValidator)

    const user = await UserService.editGitalbId({ id, payload, bouncer })

    logger.info('Gitlab Id succesfully edited.')

    response.send(user)
  }
}
