import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateInviteValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    labelIds: schema.array.optional().members(schema.string({}, [rules.uuid({ version: 4 })])),
    projectIds: schema.array.optional().members(schema.string({}, [rules.uuid({ version: 4 })])),
  })
}
