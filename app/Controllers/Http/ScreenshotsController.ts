import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import ScreenshotService from 'App/Services/ScreenshotService'
import CreateScreenshotValidator from 'App/Validators/Screenshots/CreateScreenshotValidator'
import UploadScreenshotValidator from 'App/Validators/Screenshots/UploadScreenshotValidator'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import Screenshot from 'App/Models/Screenshot'
import path from 'path'

export default class ScreenshotsController {
  constructor() {}

  public async register({ request, response, logger, auth, bouncer }: HttpContextContract) {
    const user = auth.use('web').user!
    const payload = await request.validate(CreateScreenshotValidator)

    const screenshot = await ScreenshotService.register({ payload, user, bouncer })

    logger.info('Screenshot succesfully registered on database.')

    response.send(screenshot)
  }

  public async upload({ request, response, logger }: HttpContextContract) {
    const { screenshot } = await request.validate(UploadScreenshotValidator)

    const filename = screenshot.fileName || screenshot.clientName

    if (!filename) {
      throw new Exception('Filename can not be null.', 400)
    }

    const imagesDir = Application.tmpPath('uploads/images')

    screenshot.move(imagesDir)

    const imgPath = path.join(imagesDir, filename)

    const uploadUrls = await ScreenshotService.upload(imgPath)

    logger.info('Screenshot uploaded succesfully')

    response.send(uploadUrls)
  }

  public async delete({ request, response, bouncer, logger }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const screenshot = await Screenshot.find(id)

    await ScreenshotService.delete({ screenshot, bouncer })

    logger.info('Screenshot deleted succesfully')

    response.status(204)
  }
}
