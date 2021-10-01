import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import View from '@ioc:Adonis/Core/View'

export default class ResetPasswordMail extends BaseMailer {
  constructor(private email: string, private url: string) {
    super()
  }

  public async prepare(message: MessageContract) {
    message
      .subject('OMNILEAF - Reset your password')
      .from('no-reply@mg.omnileaf.tk')
      .to(this.email)
      .html(await View.render('emails/reset-password', { url: this.url }))
  }
}
