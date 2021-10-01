import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Organization from 'App/Models/Organization'
import { Exception } from '@poppinss/utils'

type PayloadProps = {
  userId: string
}

export default class RemoveOrganizationMemberValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    userId: schema.string({}, [rules.uuid({ version: 4 })]),
  })
}

export const ValidateRemoveOrganizationMember = async (id: string, request) => {
  const { userId }: PayloadProps = await request.validate(RemoveOrganizationMemberValidator)

  const organization = await Organization.findOrFail(id)

  if (organization.creatorId === userId) {
    throw new Exception("Organization creator can't be deleted", 401)
  }

  return { userId, organization }
}
