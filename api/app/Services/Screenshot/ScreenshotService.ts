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
  public async register({ trackingSessionId, bouncer }: RegisterScreenshotRequest) {
    const trackingSession = await TrackingSession.find(trackingSessionId)

    if (!trackingSession) {
      throw new Exception('Tracking session not found.', 404)
    }

    await bouncer.authorize('SessionOwner', trackingSession)

    const screenshot = await Screenshot.create({
      trackingSessionId: trackingSession.id,
    })

    return screenshot
  }

  public async uploadRegular(filePath: string, buffer: Buffer) {
    const compressedBuffer = await this._compressBuffer(buffer)

    const compressionRate = await this._getCompressionRate(buffer, compressedBuffer)

    Logger.info(`Succesfully compressed ${compressionRate}% of image size.`)

    await S3Service.uploadImage(filePath, compressedBuffer)
  }

  public async uploadBlurred(filePath: string, buffer: Buffer) {
    const compressedAndBlurredBuffer = await this._compressAndBlurBuffer(buffer)

    const compressionRate = await this._getCompressionRate(buffer, compressedAndBlurredBuffer)

    Logger.info(`Succesfully compressed ${compressionRate}% of image size.`)

    await S3Service.uploadImage(filePath, compressedAndBlurredBuffer)
  }

  private async _compressBuffer(buffer: Buffer) {
    return await sharp(buffer).png({ quality: 80, compressionLevel: 9 }).toBuffer()
  }

  private async _compressAndBlurBuffer(buffer: Buffer) {
    return await sharp(buffer).blur(10).png({ quality: 20, compressionLevel: 7 }).toBuffer()
  }

  private async _getCompressionRate(buffer: Buffer, minified: Buffer) {
    const metadata = await sharp(buffer).metadata()
    const minifiedMetada = await sharp(minified).metadata()

    const sizeCompressed = metadata.size! - minifiedMetada.size!

    return Math.floor((sizeCompressed / metadata.size!) * 100)
  }

  public async delete({ id, bouncer }: DeleteScreenshotRequest) {
    const screenshot = await Screenshot.find(id)

    if (!screenshot) {
      throw new Exception('Screenshot not found.', 404)
    }

    //Authorize project Manager
    const task = await Task.findOrFail(screenshot.taskId)
    await task.load('project')
    await bouncer.authorize('ProjectManager', task.project)

    await S3Service.deleteImage(screenshot.location)
    await S3Service.deleteImage(screenshot.blurredLocation)

    await screenshot.merge({ isDeleted: true }).save()
  }
}

export default new ScreenShotService()
