import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'

export default class WelcomeToOrganizationMail extends BaseMailer {
  constructor(private email: string, private organization: string) {
    super()
  }

  public async prepare(message: MessageContract) {
    message
      .subject(`Welcome to ${this.organization}`)
      .from(`Omnileaf<no-reply@${Env.get('APP_DOMAIN')}>`)
      .to(this.email)
      .text(`Now you're officialy welcomed to ${this.organization}!!`)
  }
}
