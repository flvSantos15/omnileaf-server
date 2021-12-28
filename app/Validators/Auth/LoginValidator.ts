import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Exception } from '@poppinss/utils'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

type PayloadProps = {
  email: string
  password: string
}

export default class LoginValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    email: schema.string({}, [rules.email({ sanitize: true })]),
    password: schema.string(),
  })
}

export const ValidateLogin = async (request): Promise<User> => {
  const { email, password }: PayloadProps = await request.validate(LoginValidator)

  const user = await User.findByOrFail('email', email)

  if (user && !(await Hash.verify(user.password, password))) {
    throw new Exception('Invalid credentials', 403)
  }

  return user
}
