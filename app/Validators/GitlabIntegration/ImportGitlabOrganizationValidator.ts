import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImportGitlabOrganizationValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    gitlabId: schema.number(),
  })
}
