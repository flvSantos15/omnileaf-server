import sendgrid from '@sendgrid/mail'
import { MailDriverContract, MessageNode } from '@ioc:Adonis/Addons/Mail'

/**
 * Config accepted by the driver
 */
export type SendgridConfig = {
  driver: 'sendgrid'
  auth: {
    apiKey: string
  }
}

export class SendgridDriver implements MailDriverContract {
  private transporter: any

  constructor(private config: SendgridConfig) {
    /**
     * Instantiate the nodemailer transport
     */
    sendgrid.setApiKey(this.config.auth.apiKey)

    this.transporter = sendgrid
  }

  /**
   * Send email using the underlying transport
   */
  public async send(message: MessageNode) {
    return this.transporter.send(message)
  }

  /**
   * Cleanup resources
   */
  public close() {
    this.transporter = null
  }
}
