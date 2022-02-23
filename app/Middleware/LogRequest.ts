import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LogRequest {
  public async handle({ request, logger }: HttpContextContract, next: () => Promise<void>) {
    if (request.url().includes('/docs')) {
      await next()
      return
    }

    logger.info(`New ${request.method()} request to: ${request.url()}`)
    await next()
  }
}
