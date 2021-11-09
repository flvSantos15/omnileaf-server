import { Exception } from '@poppinss/utils'
import { LogCreated } from 'App/Helpers/CustomLogs'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import ResetPasswordToken from 'App/Models/ResetPasswordToken'
import ResetPasswordMail from 'App/Mailers/ResetPasswordMail'

interface Irequest {
  payload: {
    email: string
  }
}

export default class ForgotPasswordService {
  private _getResetPasswordAdress(tokenId: string): string {
    return `${Env.get('FRONT_END_URL')}/reset-password/${tokenId}`
  }

  private async _sendResetPasswordEmail({ token }: { token: ResetPasswordToken }): Promise<void> {
    const resetPasswordMailSender = new ResetPasswordMail(
      token.userEmail,
      this._getResetPasswordAdress(token.id)
    )

    await resetPasswordMailSender.send()
  }

  public async execute({ payload }: Irequest): Promise<ResetPasswordToken> {
    const { email } = payload

    if (!(await User.findBy('email', email))) {
      throw new Exception('Email does not exists.', 404)
    }

    const token = await ResetPasswordToken.updateOrCreate(
      { userEmail: email },
      { userEmail: email }
    )

    LogCreated(token)

    await this._sendResetPasswordEmail({ token })

    return token
  }
}
