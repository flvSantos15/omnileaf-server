import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { Exception } from '@poppinss/utils'

type PayloadProps = {
  name: string | undefined
  displayName: string | undefined
  email: string | undefined
  password: string | undefined
  avatar_url: string | undefined
  phone: string | undefined
}

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string.optional(),
    displayName: schema.string.optional(),
    email: schema.string.optional({}, [rules.email({ sanitize: true })]),
    password: schema.string.optional(),
    avatar_url: schema.string.optional({}, [rules.url()]),
    phone: schema.string.optional({}, [rules.alpha()]),
  })
}

export const ValidateUpdateUser = async (id: string, request) => {
  const payload: PayloadProps = await request.validate(UpdateUserValidator)

  if (payload.email) {
    const user = await User.query().where('email', payload.email).andWhereNot('id', id)
    if (user.length) throw new Exception('Email is already registered for another user.', 409)
  }

  return payload
}
