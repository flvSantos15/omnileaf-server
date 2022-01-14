import fs from 'fs'
import path from 'path'
import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import ScreenshotService from 'App/Services/Screenshot/ScreenshotService'
import CreateScreenshotValidator from 'App/Validators/Screenshots/CreateScreenshotValidator'
import UuidValidator from 'App/Validators/Global/UuidValidator'

export default class ScreenshotsController {
  constructor() {}

  public async register({ request, response, logger, auth, bouncer }: HttpContextContract) {
    const user = auth.use('web').user!

    const { trackingSessionId, screenshotMultiPart } = await request.validate(
      CreateScreenshotValidator
    )

    const screenshot = await ScreenshotService.register({ trackingSessionId, user, bouncer })

    const filename = screenshotMultiPart.fileName || screenshotMultiPart.clientName

    if (!filename) {
      throw new Exception('Filename can not be null.', 400)
    }

    const imagesDir = Application.tmpPath('uploads/images')

    await screenshotMultiPart.move(imagesDir)

    const buffer = this._getImageAsBufferAndDeleteFile(imagesDir, filename)

    await ScreenshotService.uploadRegular(screenshot.location, buffer)

    await ScreenshotService.uploadBlurred(screenshot.blurredLocation, buffer)

    logger.info('Screenshot succesfully registered on database.')

    response.send(screenshot.serialize())
  }

  private _getImageAsBufferAndDeleteFile(imagesDir: string, filename: string): Buffer {
    const imgPath = path.join(imagesDir, filename)

    const buffer = fs.readFileSync(imgPath)

    fs.unlinkSync(imgPath)

    return buffer
  }

  public async delete({ request, response, bouncer, logger }: HttpContextContract) {
    const id = UuidValidator.v4(request.param('id'))

    await ScreenshotService.delete({ id, bouncer })

    logger.info('Screenshot deleted succesfully')

    response.status(204)
  }
}
