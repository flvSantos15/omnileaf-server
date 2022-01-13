import fs from 'fs'
import sharp from 'sharp'
import Logger from '@ioc:Adonis/Core/Logger'
import Screenshot from 'App/Models/Screenshot'
import Task from 'App/Models/Task'
import TrackingSession from 'App/Models/TrackingSession'
import S3Service from '@ioc:Omnileaf/S3Service'
import { Exception } from '@adonisjs/core/build/standalone'
import {
  DeleteScreenshotRequest,
  RegisterScreenshotRequest,
} from 'App/Interfaces/Screenshot/screenshot-service.interface'

class ScreenShotService {
  public async register({ payload, user, bouncer }: RegisterScreenshotRequest) {
    const { trackingSessionId, url, blurredUrl } = payload

    const trackingSession = await TrackingSession.find(trackingSessionId)

    if (!trackingSession) {
      throw new Exception('Tracking session not found.', 404)
    }

    await bouncer.authorize('SessionOwner', trackingSession)

    const screenshot = await Screenshot.create({
      userId: user.id,
      url,
      blurredUrl,
      taskId: trackingSession.taskId,
      trackingSessionId: trackingSession.id,
    })

    return screenshot
  }

  private async _blurImage(buffer: Buffer) {
    return await sharp(buffer).blur(10).png({ quality: 20, compressionLevel: 7 }).toBuffer()
  }

  private async _getCompressionRate(buffer: Buffer, minified: Buffer) {
    const metadata = await sharp(buffer).metadata()
    const minifiedMetada = await sharp(minified).metadata()

    const sizeCompressed = metadata.size! - minifiedMetada.size!

    return Math.floor((sizeCompressed / metadata.size!) * 100)
  }

  private async _compressImage(buffer: Buffer) {
    return await sharp(buffer).png({ quality: 80, compressionLevel: 9 }).toBuffer()
  }

  public async upload(imgPath: string) {
    const buffer = fs.readFileSync(imgPath)

    fs.unlinkSync(imgPath)

    const minifiedImgBuffer = await this._compressImage(buffer)

    const compressionRate = await this._getCompressionRate(buffer, minifiedImgBuffer)

    Logger.info(`Succesfully compressed ${compressionRate}% of image size.`)

    const blurredImgBuffer = await this._blurImage(buffer)

    const url = await S3Service.uploadImage(minifiedImgBuffer)
    const blurredUrl = await S3Service.uploadImage(blurredImgBuffer)

    console.log(url, blurredUrl)

    return { url, blurredUrl }
  }

  public async delete({ screenshot, bouncer }: DeleteScreenshotRequest) {
    if (!screenshot) {
      throw new Exception('Screenshot not found.', 404)
    }

    //Authorize project Manager
    const task = await Task.findOrFail(screenshot.taskId)
    await task.load('project')
    await bouncer.authorize('ProjectManager', task.project)

    await S3Service.deleteImage(screenshot.url)
    await S3Service.deleteImage(screenshot.blurredUrl)

    await screenshot.merge({ isDeleted: true }).save()
  }
}

export default new ScreenShotService()
