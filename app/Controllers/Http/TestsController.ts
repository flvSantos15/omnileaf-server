import { Exception } from '@adonisjs/core/build/standalone'
import Application from '@ioc:Adonis/Core/Application'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TestsController {
  public async test({ request, response, logger }: HttpContextContract) {
    const screenshotMultiPart = request.file('screenshotMultiPart')

    const filename = screenshotMultiPart?.fileName
      ? screenshotMultiPart?.fileName
      : screenshotMultiPart?.clientName

    if (!filename) {
      throw new Exception('Could not get filename', 400)
    }

    await screenshotMultiPart!.move(Application.tmpPath('uploads/images/original'))

    // await ScreenshotService.upload(imgPath)

    logger.info('Image uploaded succesfully')

    response.send('it worked ?')
  }
}
