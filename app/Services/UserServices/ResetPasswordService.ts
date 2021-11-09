import { Exception } from '@poppinss/utils'
import { createDateAsUTC } from 'App/Utils/CreateDateAsUTC'
import { isAfter } from 'date-fns'
import ResetPasswordToken from 'App/Models/ResetPasswordToken'
import User from 'App/Models/User'
import { LogDeleted, LogUpdated } from 'App/Helpers/CustomLogs'
import { AuthContract } from '@ioc:Adonis/Addons/Auth'

interface Irequest {
  id: string
  payload: {
    password: string
    passwordConfirmation: string
  }
  auth: AuthContract
}

export default class ResetPasswordService {
  private _validateTokenExpiration({ token }: { token: ResetPasswordToken }): boolean {
    const tokenExpirationInDateTime = Date.parse(token.expiresIn)

    const currentDateTime = createDateAsUTC(new Date())

    return isAfter(currentDateTime, tokenExpirationInDateTime)
  }

  private _treatExceptions({
    token,
    password,
    passwordConfirmation,
  }: {
    token: ResetPasswordToken | null
    password: string
    passwordConfirmation: string
  }) {
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
  }

  public async execute({ id, payload, auth }: Irequest): Promise<void> {
    const { password, passwordConfirmation } = payload
    const token = await ResetPasswordToken.find(id)

    this._treatExceptions({ token, password, passwordConfirmation })

    const user = await User.findBy('email', token!.userEmail)

    if (!user) {
      throw new Exception('User email does not exists', 404)
    }

    await user.merge({ password }).save()

    LogUpdated(user)

    await token!.delete()

    LogDeleted(token)

    const rememberMe = true

    await auth.use('web').login(user, rememberMe)
  }
}
