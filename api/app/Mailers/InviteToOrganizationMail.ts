import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'

export default class InviteToOrganizationMail extends BaseMailer {
  constructor(private email: string, private organization: string) {
    super()
  }

  public async prepare(message: MessageContract) {
    message
      .subject(`New invite from ${this.organization}`)
      .from(`Omnileaf<no-reply@${Env.get('APP_DOMAIN')}>`)
      .to(this.email)
      .text(`You've been invited to join ${this.organization}!!`)
  }
}
