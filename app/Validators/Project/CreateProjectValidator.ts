import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateProjectValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string(),
    description: schema.string.optional(),
    organizationId: schema.string({}, [rules.uuid({ version: 4 })]),
  })
}
