import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ConnectOrganizationToGitlabValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    organizationId: schema.string({}, [rules.uuid({ version: '4' })]),
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
