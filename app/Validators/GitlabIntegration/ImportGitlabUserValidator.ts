import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImportGitlabUserValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    gitlabId: schema.number(),
    token: schema.object().members({
      access_token: schema.string(),
      refresh_token: schema.string(),
      expires_in: schema.number(),
      created_at: schema.number(),
      token_type: schema.string.optional(),
      scope: schema.string.optional(),
    }),
  })
}
