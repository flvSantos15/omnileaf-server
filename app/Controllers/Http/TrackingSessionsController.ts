import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LogCreated, LogList, LogShow, LogUpdated } from 'App/Helpers/CustomLogs'
import { LoadTrackingSessionRelations } from 'App/Helpers/RelationsLoaders/TrackingSessionLoaders'
import TrackingSession from 'App/Models/TrackingSession'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import { ValidateCreateTrackingSession } from 'App/Validators/TrackingSession/CreateTrackingSessionValidator'
import { TrackingSessionStatus } from 'Contracts/enums'

export default class TrackingSessionsController {
  public async list({ response }: HttpContextContract) {
    const trackingSessions = await TrackingSession.all()

    LogList(trackingSessions)

    response.send(trackingSessions)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const trackingSession = await LoadTrackingSessionRelations(id)

    LogShow(trackingSession)

    response.send(trackingSession)
  }

  public async create({ request, response, auth, bouncer }: HttpContextContract) {
    const user = auth.use('web').user!

    const task = await ValidateCreateTrackingSession(request)

    //Authorize user assigned to project
    await task.load('project')
    await bouncer.authorize('AssignedToProject', task.project)

    const trackingSession = await TrackingSession.create({ taskId: task.id, userId: user.id })

    LogCreated(trackingSession)

    response.status(201)
  }

  public async closeSession({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const trackingSession = await TrackingSession.findOrFail(id)

    await bouncer.authorize('OwnUser', trackingSession.userId)

    await trackingSession.merge({ status: TrackingSessionStatus.FINISHED }).save()

    LogUpdated(trackingSession)

    response.status(200)
  }
}
