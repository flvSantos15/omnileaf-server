import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImportGitlabProjectValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    id: schema.number(),
    name: schema.string(),
    description: schema.string.optional(),
    created_at: schema.date(),
    creator_id: schema.number(),
    avatar_url: schema.string.optional(),
  })
}
