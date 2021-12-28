import { Exception } from '@adonisjs/core/build/standalone'
import Application from '@ioc:Adonis/Core/Application'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import S3Service from '@ioc:Omnileaf/S3Service'
import fs from 'fs'

export default class TestsController {
  public async test({ request, response, logger }: HttpContextContract) {
    const screenshotMultiPart = request.file('screenshotMultiPart')

    const filename = screenshotMultiPart?.fileName
      ? screenshotMultiPart?.fileName
      : screenshotMultiPart?.clientName

    if (!filename) {
      throw new Exception('Could not get filename', 400)
    }

    const imgPath = Application.tmpPath(`uploads/images/original/${filename}`)

    await screenshotMultiPart!.move(Application.tmpPath('uploads/images/original'))

    const buffer = fs.readFileSync(imgPath)

    await S3Service.uploadImage(buffer)

    // await ScreenshotService.upload(imgPath)

    logger.info('Image uploaded succesfully')

    response.send('it worked ?')
  }
}
