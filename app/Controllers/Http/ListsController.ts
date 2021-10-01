import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LogList } from 'App/Helpers/CustomLogs'
import List from 'App/Models/List'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'

export default class ListsController {
  public async list({ response }: HttpContextContract) {
    const lists = await List.all()

    LogList(lists)

    response.send(lists)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))
  }
}
