import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/User/CreateUserValidator'
import UsersExceptions from 'App/Exceptions/CustomExceptionsHandlers/UsersExceptions'
import UpdateUserValidator from 'App/Validators/User/UpdateUserValidator'
import ResetPasswordExceptions from 'App/Exceptions/CustomExceptionsHandlers/ResetPasswordExceptions'
import ResetPasswordToken from 'App/Models/ResetPasswordToken'
import ForgotPassworValidator from 'App/Validators/User/ForgotPasswordValidator'
import ResetPassworValidator from 'App/Validators/User/ResetPasswordValidator'
import ResetPassword from 'App/Mailers/ResetPassword'
import Env from '@ioc:Adonis/Core/Env'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LogCreated, LogDeleted, LogList, LogShow, LogUpdated } from 'App/Helpers/CustomLogs'

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

  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email } = await request.validate(ForgotPassworValidator)

    await ResetPasswordExceptions.CheckIfEmailExists(email)

    let token = await ResetPasswordToken.updateOrCreate({ userEmail: email }, { userEmail: email })

    const resetPasswordUrl = `${Env.get('FRONT_END_URL')}/reset-password/${token.id}`

    await new ResetPassword(token.userEmail, resetPasswordUrl).send()

    LogCreated(token)

    response.json(token)
  }

  public async resetPassword({ request, response, auth }: HttpContextContract) {
    const id = request.param('tokenId')

    const token = await ResetPasswordToken.findOrFail(id)

    ResetPasswordExceptions.CheckIfTokenIsExpired(token)

    const { password, passwordConfirmation } = await request.validate(ResetPassworValidator)

    ResetPasswordExceptions.CheckIfPasswordIsCorrect(password, passwordConfirmation)

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
