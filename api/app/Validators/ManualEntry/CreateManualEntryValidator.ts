import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateManualEntryValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    taskId: schema.string({}, [rules.uuid({ version: 4 })]),
    startedDate: schema.string(),
    finishedDate: schema.string(),
    workedFrom: schema.string(),
    workedTo: schema.string(),
    reason: schema.string.optional(),
  })
}
