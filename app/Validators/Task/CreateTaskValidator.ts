import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateTaskValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string(),
    body: schema.string.optional(),
    projectId: schema.string({}, [rules.uuid({ version: 4 })]),
    listId: schema.string.optional({}, [rules.uuid({ version: 4 })]),
  })
}
