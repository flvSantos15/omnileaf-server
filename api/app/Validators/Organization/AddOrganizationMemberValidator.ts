import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AddOrganizationMemberValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    userId: schema.string({}, [rules.uuid({ version: 4 })]),
    labelIds: schema.array().members(schema.string({}, [rules.uuid({ version: 4 })])),
  })
}
