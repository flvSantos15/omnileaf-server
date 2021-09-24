import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LogRequest {
  public async handle({ request, logger }: HttpContextContract, next: () => Promise<void>) {
    logger.info(`New ${request.method()} request to: ${request.url()}`)
    await next()
  }
}
