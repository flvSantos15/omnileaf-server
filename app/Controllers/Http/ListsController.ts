import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LogCreated, LogList, LogShow, LogUpdated } from 'App/Helpers/CustomLogs'
import { LoadListRelations } from 'App/Helpers/RelationsLoaders/ListRelationsLoader'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import CreateListValidator from 'App/Validators/List/CreateListValidator'
import Board from 'App/Models/Board'
import List from 'App/Models/List'
import UpdateListValidator from 'App/Validators/List/UpdateListValidator'

export default class ListsController {
  public async list({ response }: HttpContextContract) {
    const lists = await List.all()

    LogList(lists)

    response.send(lists)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const list = await LoadListRelations(id, request.qs())

    LogShow(list)

    response.send(list)
  }

  public async create({ request, response, bouncer, auth }: HttpContextContract) {
    const payload = await request.validate(CreateListValidator)

    const user = auth.use('web').user!

    //Authorizing project manager
    const board = await Board.findOrFail(payload.boardId)
    await board.load('project')
    await bouncer.authorize('ProjectManager', board.project)

    const list = await List.create({ ...payload, creatorId: user.id })

    LogCreated(list)

    response.status(201).send(list)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const payload = await request.validate(UpdateListValidator)

    //Authorizing project Manager
    const board = await Board.findOrFail(payload.boardId)
    await board.load('project')
    await bouncer.authorize('ProjectManager', board.project)

    const list = await List.findOrFail(id)

    await list.merge(payload).save()

    LogUpdated(list)

    response.send(list)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const list = await List.findOrFail(id)

    //Authorizing project Manager
    const board = await Board.findOrFail(list.boardId)
    await board.load('project')
    await bouncer.authorize('ProjectManager', board.project)

    await list.delete()

    response.status(204)
  }
}
