import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateScreenshotValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    url: schema.string(),
    blurredUrl: schema.string(),
    trackingSessionId: schema.string({}, [rules.uuid({ version: 4 })]),
  })
}
