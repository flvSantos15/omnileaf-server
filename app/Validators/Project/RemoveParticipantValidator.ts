import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Exception } from '@poppinss/utils'
import User from 'App/Models/User'
import Project from 'App/Models/Project'

type PayloadProps = {
  userId: string
}

export default class RemoveParticipantValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    userId: schema.string({}, [rules.uuid({ version: 4 })]),
  })
}

export const ValidateRemoveParticipant = async (
  request,
  project: Project
): Promise<PayloadProps> => {
  const payload = await request.validate(RemoveParticipantValidator)
  const { userId } = payload
  const user = await User.find(userId)
  if (!user) throw new Exception('User not found', 404)
  if (user.id === project.creatorId) {
    throw new Exception("Project creator can't be deleted.", 403)
  }
  return payload
}
