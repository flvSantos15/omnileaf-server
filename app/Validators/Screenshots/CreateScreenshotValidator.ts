import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TrackingSession from 'App/Models/TrackingSession'
import { Exception } from '@poppinss/utils'
import { TrackingSessionStatus } from 'Contracts/enums'

export default class CreateScreenshotValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    trackingSessionId: schema.string({}, [rules.uuid({ version: 4 })]),
    screenshotMultiPart: schema.file({ extnames: ['jpg', 'gif', 'png'] }),
  })
}

export const ValidateCreateScreenshot = async (request) => {
  const payload = await request.validate(CreateScreenshotValidator)

  const trackingSession = await TrackingSession.find(payload.trackingSessionId)
  if (!trackingSession) {
    throw new Exception('Tracking Session not found.', 404)
  }

  if (trackingSession.status === TrackingSessionStatus.FINISHED) {
    throw new Exception('Tracking Session is closed', 400)
  }

  return { trackingSession, screenshotMultiPart: payload.screenshotMultiPart }
}
