/**
 * Contract source: https://git.io/JvgAT
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import { SendgridConfig } from 'providers/SendgridDriver'

declare module '@ioc:Adonis/Addons/Mail' {
  interface MailersList {
    mailgun: MailDrivers['mailgun']
    sendgrid: {
      config: SendgridConfig
      implementation: MailDriverContract
    }
  }
}
