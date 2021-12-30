import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImportJiraUserValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    token: schema.object().members({
      token: schema.string(),
      refresh_token: schema.string(),
      scope: schema.string(),
      expires_in: schema.number(),
    }),
  })
}
