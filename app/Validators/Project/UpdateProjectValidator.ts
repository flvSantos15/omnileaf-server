import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { Exception } from '@poppinss/utils'

type PayloadProps = {
  name: string
  description: string | undefined
  userInChargeId: string | undefined
}

class UpdateProjectValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string.optional(),
    description: schema.string.optional(),
    userInChargeId: schema.string.optional({}, [rules.uuid({ version: 4 })]),
  })
}

export const ValidateUpdateProject = async (request): Promise<PayloadProps> => {
  const payload: PayloadProps = request.validate(UpdateProjectValidator)

  if (payload.userInChargeId) {
    const userExists = await User.find(payload.userInChargeId)
    if (!userExists) {
      throw new Exception('User in charge not found', 404)
    }
  }

  return payload
}
