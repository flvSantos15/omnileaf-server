import Application from '@ioc:Adonis/Core/Application'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ValidateCreateScreenshot } from 'App/Validators/Screenshots/CreateScreenshotValidator'
import ScreenshotUploadService from 'App/Services/UploadService/ScreenshotUploadService'
import Screenshot from 'App/Models/Screenshot'
import { LogCreated, LogDeleted } from 'App/Helpers/CustomLogs'
import { validateIdParam } from 'App/Validators/Global/IdParamValidator'
import Task from 'App/Models/Task'
import RemoveImageService from 'App/Services/UploadService/RemoveImageService'

export default class ScreenshotsController {
  private screenshotUploadService: ScreenshotUploadService
  private removeImageService: RemoveImageService
  private originalImagesDir: string

  constructor() {
    this.screenshotUploadService = new ScreenshotUploadService()
    this.originalImagesDir = Application.tmpPath('uploads/images/original')
    this.removeImageService = new RemoveImageService()
  }

  public async create({ request, response, logger, auth, bouncer }: HttpContextContract) {
    const user = auth.use('web').user!
    const { trackingSession, screenshotMultiPart } = await ValidateCreateScreenshot(request)

    //Authorize user Session Owner
    await bouncer.authorize('SessionOwner', trackingSession)

    await screenshotMultiPart.move(this.originalImagesDir)

    const [url, blurredUrl] = await this.screenshotUploadService.execute(
      screenshotMultiPart.fileName!
    )

    logger.info('Image uploaded succesfully')

    const screenshot = await Screenshot.create({
      userId: user.id,
      url,
      blurredUrl,
      taskId: trackingSession.taskId,
      trackingSessionId: trackingSession.id,
    })

    LogCreated(screenshot)

    response.send(screenshot)
  }

  public async delete({ request, response, bouncer }: HttpContextContract) {
    const id = validateIdParam(request.param('id'))

    const screenshot = await Screenshot.findOrFail(id)

    //Authorize project Manager
    const task = await Task.findOrFail(screenshot.taskId)
    await task.load('project')
    await bouncer.authorize('ProjectManager', task.project)

    //Delete image from bucket
    await this.removeImageService.execute(screenshot.url)
    await this.removeImageService.execute(screenshot.blurredUrl)

    LogDeleted(screenshot)

    await screenshot.delete()

    response.status(204)
  }
}
