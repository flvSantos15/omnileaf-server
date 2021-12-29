import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LogCreated, LogList, LogShow, LogUpdated } from 'App/Helpers/CustomLogs'
import { LoadBoardRelations } from 'App/Helpers/RelationsLoaders/BoardRelationLoaders'
import Board from 'App/Models/Board'
import Project from 'App/Models/Project'
import CreateBoardValidator from 'App/Validators/Board/CreateBoardValidator'
import UpdateBoardValidator from 'App/Validators/Board/UpdateBoardValidator'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'

export default class BoardsController {
  public async list({ response }: HttpContextContract) {
    const boards = await Board.all()

    LogList(boards)

    response.send(boards)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const board = await LoadBoardRelations(id, request.qs())

    LogShow(board)

    response.send(board)
  }

  public async create({ request, response, bouncer, auth }: HttpContextContract) {
    const payload = await request.validate(CreateBoardValidator)

    const user = auth.use('web').user!

    //Authorizing project manager
    const project = await Project.findOrFail(payload.projectId)
    await bouncer.authorize('ProjectManager', project)

    const board = await Board.create({ ...payload, creatorId: user.id })

    LogCreated(board)

    response.status(201).send(board)
  }

  public async update({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))
    const payload = await request.validate(UpdateBoardValidator)

    const board = await Board.findOrFail(id)

    //Authorize Manager
    await board.load('project')
    const project = board.project
    await bouncer.authorize('ProjectManager', project)

    await board.merge(payload).save()

    LogUpdated(board)

    response.send(board)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const board = await Board.findOrFail(id)

    //Authorize Manager
    await board.load('project')
    const project = board.project
    await bouncer.authorize('ProjectManager', project)

    await board.delete()

    response.status(204)
  }
}
