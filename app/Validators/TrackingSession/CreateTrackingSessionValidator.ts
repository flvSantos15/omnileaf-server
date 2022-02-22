import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateTrackingSessionValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    taskId: schema.string({}, [rules.uuid({ version: 4 })]),
  })
}
