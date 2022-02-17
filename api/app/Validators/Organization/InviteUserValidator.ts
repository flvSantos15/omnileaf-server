import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InviteUserValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    email: schema.string({}, [rules.email()]),
    labelIds: schema.array().members(schema.string({}, [rules.uuid({ version: 4 })])),
  })
}
