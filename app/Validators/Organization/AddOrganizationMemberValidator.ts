import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { OrganizationRoles } from 'Contracts/enums'
import { Exception } from '@poppinss/utils'
import User from 'App/Models/User'

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
  const { userId } = payload

  //Validates if user exists
  const user = await User.find(userId)
  if (!user) throw new Exception('User not found', 404)

  //Validates if user is already in organization
  await user.load('organizations')
  if (user.organizations.map((org) => org.id).includes(id)) {
    throw new Exception('User is already a member', 409)
  }

  //Return payload and organization
  return payload
}
