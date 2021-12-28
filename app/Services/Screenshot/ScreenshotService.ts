import fs from 'fs'
import sharp from 'sharp'
import Logger from '@ioc:Adonis/Core/Logger'
import SpacesService from '../SpacesService'
import User from 'App/Models/User'
import Screenshot from 'App/Models/Screenshot'
import Task from 'App/Models/Task'
import TrackingSession from 'App/Models/TrackingSession'
import { Exception } from '@adonisjs/core/build/standalone'
import { ActionsAuthorizerContract } from '@ioc:Adonis/Addons/Bouncer'

interface RegisterRequest {
  payload: {
    trackingSessionId: string
    url: string
    blurredUrl: string
  }
  user: User
  bouncer: ActionsAuthorizerContract<User>
}

interface DeleteRequest {
  screenshot: Screenshot | null
  bouncer: ActionsAuthorizerContract<User>
}

class ScreenShotService {
  public async register({ payload, user, bouncer }: RegisterRequest) {
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

    const url = await SpacesService.uploadImage(minifiedImgBuffer)
    const blurredUrl = await SpacesService.uploadImage(blurredImgBuffer)

    console.log(url, blurredUrl)

    return { url, blurredUrl }
  }

  public async delete({ screenshot, bouncer }: DeleteRequest) {
    if (!screenshot) {
      throw new Exception('Screenshot not found.', 404)
    }

    //Authorize project Manager
    const task = await Task.findOrFail(screenshot.taskId)
    await task.load('project')
    await bouncer.authorize('ProjectManager', task.project)

    await SpacesService.deleteImage(screenshot.url)
    await SpacesService.deleteImage(screenshot.blurredUrl)

    await screenshot.merge({ isDeleted: true }).save()
  }
}

export default new ScreenShotService()
