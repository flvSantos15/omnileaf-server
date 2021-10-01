import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ResetPasswordToken from 'App/Models/ResetPasswordToken'
import { createDateAsUTC } from 'App/Utils/CreateDateAsUTC'
import isAfter from 'date-fns/isAfter'
import { Exception } from '@poppinss/utils'

type PayloadProps = {
  password: string
  passwordConfirmation: string
}

export default class ResetPassworValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    password: schema.string(),
    passwordConfirmation: schema.string(),
  })
}

export const ValidateResetPassword = async (id: string, request) => {
  const token = await ResetPasswordToken.findOrFail(id)

  const { password, passwordConfirmation }: PayloadProps = await request.validate(
    ResetPassworValidator
  )

  // Validates if token is expired
  const tokenExpirationInDateTime = Date.parse(token.expiresIn)

  const currentDateTime = createDateAsUTC(new Date())

  if (isAfter(currentDateTime, tokenExpirationInDateTime)) {
    throw new Exception('Reset Password token is expired, please generate a new one.', 403)
  }

  //Validates if passwords matches
  if (password !== passwordConfirmation) {
    throw new Exception("Confirmation password doesn't match.", 400)
  }

  //Return token and password
  return { token, password }
}
