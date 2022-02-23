import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateTrackingSessionValidator from 'App/Validators/TrackingSession/CreateTrackingSessionValidator'
import TrackingSessionService from 'App/Services/TrackingSession/TrackingSessionService'
import UuidValidator from 'App/Validators/Global/UuidValidator'
import UpdateTrackingTimeValidator from 'App/Validators/TrackingSession/UpdateTrackingTimeValidator'
import CloseSessionValidator from 'App/Validators/TrackingSession/CloseSessionValidator'
import CreateManySessionValidator from 'App/Validators/TrackingSession/CreateManySessionValidator'

export default class TrackingSessionsController {
  public async list({ response, logger }: HttpContextContract) {
    const trackingSessions = await TrackingSessionService.getAll()

    logger.info('Succesfully retrieved Tracking Sessions list')

    response.send(trackingSessions)
  }

  public async show({ request, response, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const trackingSession = await TrackingSessionService.getOne(id)

    logger.info('Succesfully retrieved Tracking Session')

    response.send(trackingSession)
  }

  public async create({ request, response, auth, bouncer, logger }: HttpContextContract) {
    const user = auth.use('web').user!

    const payload = await request.validate(CreateTrackingSessionValidator)

    const trackingSession = await TrackingSessionService.register({ payload, user, bouncer })

    logger.info('Succesfully created Tracking Session')

    response.status(201).send(trackingSession)
  }

  public async updateTrackingTime({ request, response, bouncer, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(UpdateTrackingTimeValidator)

    await TrackingSessionService.updateTrackingTime({ id, payload, bouncer })

    logger.info('Succesfully updated Tracking Session Time')

    response.status(204)
  }

  public async closeSession({ request, response, bouncer, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    const payload = await request.validate(CloseSessionValidator)

    await TrackingSessionService.closeSession({ id, payload, bouncer })

    logger.info('Succesfully closed Tracking Session')

    response.status(204)
  }

  public async createMany({ request, response, bouncer, logger }: HttpContextContract) {
    const payload = await request.validate(CreateManySessionValidator)

    await TrackingSessionService.createMany({ payload, bouncer })

    logger.info('Succesfully created many sessions at once')

    response.status(201)
  }
}
