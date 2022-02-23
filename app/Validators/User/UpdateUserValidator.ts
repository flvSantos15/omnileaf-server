import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string.optional(),
    displayName: schema.string.optional(),
    email: schema.string.optional({}, [rules.email({ sanitize: true })]),
    password: schema.string.optional(),
    avatar_url: schema.string.optional({}, [rules.url()]),
    phone: schema.string.optional({}, [rules.alpha()]),
  })
}
