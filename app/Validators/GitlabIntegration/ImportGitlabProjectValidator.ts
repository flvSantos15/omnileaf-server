import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImportGitlabProjectValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    project: schema.object().members({
      id: schema.number(),
      name: schema.string(),
      description: schema.string.optional(),
      created_at: schema.date(),
      creator_id: schema.number.optional(),
      avatar_url: schema.string.optional(),
    }),
    organizationId: schema.string({}, [rules.uuid({ version: '4' })]),
    token: schema.string.optional(),
  })
}
