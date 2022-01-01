import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateTaskValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string.optional(),
    body: schema.string.optional(),
    timeEstimated: schema.number.optional(),
    listId: schema.string.optional({}, [rules.uuid({ version: 4 })]),
  })
}
