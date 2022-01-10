import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import CreateTrackingSessionValidator from 'App/Validators/TrackingSession/CreateTrackingSessionValidator'
import TrackingSessionService from 'App/Services/TrackingSession/TrackingSessionService'
import Logger from '@ioc:Adonis/Core/Logger'

export default class TrackingSessionsController {
  public async list({ response }: HttpContextContract) {
    const trackingSessions = await TrackingSessionService.getAll()

    Logger.info('Succesfully retrieved Tracking Sessions list')

    response.send(trackingSessions)
  }

  public async show({ request, response }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const trackingSession = await TrackingSessionService.getOne(id)

    Logger.info('Succesfully retrieved Tracking Session')

    response.send(trackingSession)
  }

  public async create({ request, response, auth, bouncer }: HttpContextContract) {
    const user = auth.use('web').user!

    const payload = await request.validate(CreateTrackingSessionValidator)

    const trackingSession = await TrackingSessionService.register({ payload, user, bouncer })

    Logger.info('Succesfully created Tracking Session')

    response.status(201).send(trackingSession)
  }

  public async closeSession({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    await TrackingSessionService.closeSession({ id, bouncer })

    Logger.info('Succesfully closed Tracking Session')

    response.status(200)
  }
}
