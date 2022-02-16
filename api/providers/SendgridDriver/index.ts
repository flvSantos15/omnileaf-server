import nodemailer from 'nodemailer'
import sendgridTransporter from 'nodemailer-sendgrid-transport'
import { MailDriverContract, MessageNode } from '@ioc:Adonis/Addons/Mail'

/**
 * Config accepted by the driver
 */
export type SendgridConfig = {
  driver: 'sendgrid'
  auth: {
    api_key: string
  }
}

export class SendgridDriver implements MailDriverContract {
  private transporter: any

  constructor(private config: SendgridConfig) {
    /**
     * Instantiate the nodemailer transport
     */
    console.log(this.config)
    this.transporter = nodemailer.createTransport(sendgridTransporter(this.config))
  }

  /**
   * Send email using the underlying transport
   */
  public async send(message: MessageNode) {
    return this.transporter.sendMail(message)
  }

  /**
   * Cleanup resources
   */
  public close() {
    this.transporter.close()
    this.transporter = null
  }
}
