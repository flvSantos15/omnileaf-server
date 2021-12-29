import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UploadScreenshotValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    screenshot: schema.file({ extnames: ['png'] }),
  })
}
