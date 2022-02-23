import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ScreenshotService from 'App/Services/Screenshot/ScreenshotService'
import CreateScreenshotValidator from 'App/Validators/Screenshots/CreateScreenshotValidator'
import UuidValidator from 'App/Validators/Global/UuidValidator'

export default class ScreenshotsController {
  constructor() {}

  public async register({ request, response, logger, bouncer }: HttpContextContract) {
    const { base64, ...payload } = await request.validate(CreateScreenshotValidator)

    const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64')

    const screenshot = await ScreenshotService.register({ payload, bouncer, buffer })

    logger.info('Screenshot succesfully registered on database.')

    response.send(screenshot.serialize())
  }

  public async delete({ request, response, bouncer, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    await ScreenshotService.delete({ id, bouncer })

    logger.info('Screenshot deleted succesfully')

    response.status(204)
  }
}
