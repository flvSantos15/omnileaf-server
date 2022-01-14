import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateOrganizationValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string.optional(),
    avatar_url: schema.string.optional({}, [rules.url()]),
    description: schema.string.optional(),
  })
}
