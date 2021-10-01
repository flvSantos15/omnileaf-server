import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { Exception } from '@poppinss/utils'

type PayloadProps = {
  name: string
  displayName: string
  email: string
  password: string
  avatar_url: string | undefined
  phone: string | undefined
}

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    name: schema.string(),
    displayName: schema.string(),
    email: schema.string({}, [rules.email({ sanitize: true })]),
    password: schema.string(),
    avatar_url: schema.string.optional({}, [rules.url()]),
    phone: schema.string.optional({}, [rules.alpha()]),
  })
}

export const ValidateCreateUser = async (request: any) => {
  const payload: PayloadProps = await request.validate(CreateUserValidator)

  if (await User.findBy('email', payload.email)) {
    throw new Exception('Email is already registered.', 409)
  }

  return payload
}
