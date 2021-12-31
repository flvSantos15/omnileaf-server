import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TestsController {
  public async test({ response, auth }: HttpContextContract) {
    const user = auth.use('web').user!

    await user.load('jiraToken')

    response.send(user.serialize())
  }
}
