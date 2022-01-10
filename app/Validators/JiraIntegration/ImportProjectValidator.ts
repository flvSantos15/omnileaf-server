import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImportJiraProjectValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    jiraId: schema.string({}),
  })
}
