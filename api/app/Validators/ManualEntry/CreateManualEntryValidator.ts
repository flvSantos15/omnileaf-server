import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateManualEntryValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    taskId: schema.string({}, [rules.uuid({ version: 4 })]),
    startedDate: schema.date({ format: 'yyyy-MM-dd' }),
    finishedDate: schema.date({ format: 'yyyy-MM-dd' }),
    workedFrom: schema.string({}, [rules.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]),
    workedTo: schema.string({}, [rules.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)]),
    reason: schema.string.optional(),
  })
}
