import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Report {
  public async handle({ request }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const params = request.qs()

    if (!params.filters) {
      throw new Exception('Filters query is necessary for this request', 400)
    }
    await next()
  }
}
