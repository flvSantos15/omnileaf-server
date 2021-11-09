import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string(),
    displayName: schema.string(),
    email: schema.string({}, [rules.email({ sanitize: true })]),
    password: schema.string(),
    avatar_url: schema.string.optional({}, [rules.url()]),
    phone: schema.string.optional({}, [rules.alpha()]),
  })
}
