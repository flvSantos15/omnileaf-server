import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImportJiraOrganizationValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    jiraSiteId: schema.string({}, [rules.uuid()]),
  })
}
