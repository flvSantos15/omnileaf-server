import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CloseSessionValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    trackingTime: schema.number(),
  })
}
