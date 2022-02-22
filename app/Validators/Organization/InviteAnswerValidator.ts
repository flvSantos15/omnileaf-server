import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { OrganizationInviteStatus } from 'Contracts/enums/organization-invite-status'

export default class InviteAnswerValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    status: schema.enum([OrganizationInviteStatus.ACCEPTED, OrganizationInviteStatus.DENIED]),
  })
}
