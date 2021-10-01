import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { OrganizationRoles } from 'Contracts/enums'
import Organization from 'App/Models/Organization'
import { Exception } from '@poppinss/utils'

type PayloadProps = {
  userId: string
  memberRole: OrganizationRoles
}

export default class AddOrganizationMemberValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    userId: schema.string({}, [rules.uuid({ version: 4 })]),
    memberRole: schema.enum(Object.values(OrganizationRoles)),
  })
}

export const ValidateAddOrganizationMember = async (id, request) => {
  const payload: PayloadProps = await request.validate(AddOrganizationMemberValidator)

  //Validates if user is already in organization
  const organization = await Organization.findOrFail(id)
  await organization.load('members')
  if (organization.members.map((member) => member.id).includes(payload.userId)) {
    throw new Exception('User is already a member', 409)
  }

  //Return payload and organization
  return { organization, payload }
}
