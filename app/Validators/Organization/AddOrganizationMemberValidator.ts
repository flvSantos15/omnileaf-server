import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { OrganizationRoles } from 'Contracts/enums'

export default class AddOrganizationMemberValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    userId: schema.string({}, [rules.uuid({ version: 4 })]),
    memberRole: schema.enum(Object.values(OrganizationRoles)),
  })
}
