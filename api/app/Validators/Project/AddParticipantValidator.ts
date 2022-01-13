import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ProjectRoles } from 'Contracts/enums'

export default class AddParticipantValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    userId: schema.string({}, [rules.uuid({ version: 4 })]),
    role: schema.enum(Object.values(ProjectRoles)),
  })
}
