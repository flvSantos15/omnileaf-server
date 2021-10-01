import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import ResetPasswordToken from 'App/Models/ResetPasswordToken'
import ResetPasswordMail from 'App/Mailers/ResetPasswordMail'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ValidateCreateUser } from 'App/Validators/User/CreateUserValidator'
import { ValidateUpdateUser } from 'App/Validators/User/UpdateUserValidator'
import { ValidateForgotPassword } from 'App/Validators/User/ForgotPasswordValidator'
import { ValidateResetPassword } from 'App/Validators/User/ResetPasswordValidator'
import { LogCreated, LogDeleted, LogList, LogShow, LogUpdated } from 'App/Helpers/CustomLogs'
import { LoadUserRelations } from 'App/Helpers/RelationsLoaders/UserRelationsLoader'

export default class UsersController {
  public async list({ response }: HttpContextContract) {
    const users = await User.all()

    LogList(users)

    response.json(users.map((user) => user.serialize()))
  }

  public async show({ request, response }: HttpContextContract) {
    const id = request.param('id')

    const user = await LoadUserRelations(id, request.qs())

    LogShow(user)

    response.json(user.serialize())
  }

  public async create({ request, response }: HttpContextContract) {
    const payload = await ValidateCreateUser(request)

    const user = await User.create(payload)

    LogCreated(user)

    response.status(201).json(user.serialize())
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = request.param('id')

    const user = await User.findOrFail(id)

    const payload = await ValidateUpdateUser(id, request)

    await bouncer.authorize('editAndDeleteUser', id)

    await user.merge(payload).save()

    LogUpdated(user)

    response.json(user.serialize())
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = request.param('id')

    const user = await User.findOrFail(id)

    await bouncer.authorize('editAndDeleteUser', id)

    LogDeleted(user)

    await user.delete()

    response.status(204)
  }

  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email } = await ValidateForgotPassword(request)

    let token = await ResetPasswordToken.updateOrCreate({ userEmail: email }, { userEmail: email })

    const resetPasswordUrl = `${Env.get('FRONT_END_URL')}/reset-password/${token.id}`

    await new ResetPasswordMail(token.userEmail, resetPasswordUrl).send()

    LogCreated(token)

    response.json(token)
  }

  public async resetPassword({ request, response, auth }: HttpContextContract) {
    const id = request.param('tokenId')

    const { token, password } = await ValidateResetPassword(id, request)

    const user = await User.findByOrFail('email', token.userEmail)

    await user.merge({ password }).save()

    LogUpdated(user)

    const rememberMe = true

    await auth.use('web').login(user, rememberMe)

    await token.delete()

    LogDeleted(token)

    response.redirect('/')
  }
}
