import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import { Exception } from '@poppinss/utils'

type PayloadProps = {
  email: string
}

export default class ForgotPassworValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    email: schema.string({}, [rules.email({ sanitize: true })]),
  })
}

export const ValidateForgotPassword = async (request) => {
  const payload: PayloadProps = await request.validate(ForgotPassworValidator)

  if (!(await User.findBy('email', payload.email))) {
    throw new Exception("Email doesn't exists.", 404)
  }

  return payload
}
