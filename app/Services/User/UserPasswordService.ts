import ResetPasswordMail from 'App/Mailers/ResetPasswordMail'
import ResetPasswordToken from 'App/Models/ResetPasswordToken'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import { Exception } from '@adonisjs/core/build/standalone'
import {
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from 'App/Interfaces/User/user-service.interfaces'
import { createDateAsUTC } from 'App/Utils/CreateDateAsUTC'
import { isAfter } from 'date-fns'

class UserPasswordService {
  public async forgotPassword({ payload }: ForgotPasswordRequest): Promise<ResetPasswordToken> {
    const { email } = payload

    if (!(await User.findBy('email', email))) {
      throw new Exception('Email is not registered.', 404)
    }

    const token = await ResetPasswordToken.updateOrCreate(
      { userEmail: email },
      { userEmail: email }
    )

    await new ResetPasswordMail(
      token.userEmail,
      `${Env.get('FRONT_END_URL')}/reset-password/${token.id}`
    ).send()

    return token
  }

  public async resetPassword({ id, payload, auth }: ResetPasswordRequest): Promise<void> {
    const { password, passwordConfirmation } = payload
    const token = await ResetPasswordToken.find(id)

    if (!token) {
      throw new Exception('Token Id does not exists.', 404)
    }

    //Validates if token is expired
    const isExpired = this._validateTokenExpiration({ token })
    if (isExpired) {
      throw new Exception('Reset Password token is expired, please generate a new one.', 403)
    }

    //Validates if passwords matches
    if (password !== passwordConfirmation) {
      throw new Exception("Confirmation password doesn't match.", 400)
    }

    const user = await User.findBy('email', token!.userEmail)

    if (!user) {
      throw new Exception('User email does not exists', 404)
    }

    await user.merge({ password }).save()

    await token!.delete()

    const rememberMe = true

    await auth.use('web').login(user, rememberMe)
  }

  private _validateTokenExpiration({ token }: { token: ResetPasswordToken }): boolean {
    const tokenExpirationInDateTime = Date.parse(token.expiresIn)

    const currentDateTime = createDateAsUTC(new Date())

    return isAfter(currentDateTime, tokenExpirationInDateTime)
  }
}

export default new UserPasswordService()
