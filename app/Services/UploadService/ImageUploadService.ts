import imagemin from 'imagemin'
import mozjpeg from 'imagemin-mozjpeg'
import Application from '@ioc:Adonis/Core/Application'
import Jimp from 'jimp'
import fs from 'fs'
import AWS from 'aws-sdk'
import Logger from '@ioc:Adonis/Core/Logger'
import sharp from 'sharp'
import sizeOf from 'image-size'
import { PutObjectRequest } from 'aws-sdk/clients/s3'
import { createString } from 'App/Utils/CreateRandomString'
import UploadService from './UploadService'

export default class ImageUploadService extends UploadService {
  protected originalImageLocation: string
  protected s3: AWS.S3
  protected uploadImageParams: PutObjectRequest
  protected logger: typeof Logger

  public async execute(filename: string): Promise<string[]> {
    this.originalImageLocation = Application.tmpPath(`uploads/images/original/${filename}`)

    const filenames = await this.executeClass()

    return filenames
  }

  protected async executeClass() {
    // Generate minified Buffer from Original Image
    const minifiedBuffer = await this.compressImages()

    //Create uploadable buffers
    const buffers = await this.generateUploadableFiles(minifiedBuffer)

    const filenames = await this.uploadToSpaces(buffers)

    return filenames
  }

  protected async convertToJpg(input: Buffer) {
    return await sharp(input).jpeg().toBuffer()
  }

  protected async generateUploadableFiles(buffer: Buffer) {
    const image = await Jimp.read(buffer)
    const imageDimensions = sizeOf(buffer)

    return [
      await image.resize(imageDimensions.width! * 0.7, Jimp.AUTO).getBufferAsync('image/jpeg'),
    ]
  }

  protected async generateMinifiedBuffers(buffer: Buffer) {
    let minifiedBuffer = await imagemin.buffer(buffer, {
      plugins: [this.convertToJpg, mozjpeg({ quality: 85 })],
    })

    const compressionRatio = 1 - minifiedBuffer.byteLength / buffer.byteLength
    const compressedPercentage = (compressionRatio * 100).toFixed(2)

    this.logger.info(`Compressed ${compressedPercentage}% of Image`)

    return minifiedBuffer
  }

  protected async compressImages(): Promise<Buffer> {
    const originalImage = fs.readFileSync(this.originalImageLocation)

    const minifiedBuffer = await this.generateMinifiedBuffers(originalImage)

    fs.unlinkSync(this.originalImageLocation)

    return minifiedBuffer
  }

  protected async uploadToSpaces(buffers: Buffer[]) {
    const filenames: string[] = []

    for (let buffer of buffers) {
      let filename = createString(60)
      this.uploadImageParams.Body = buffer
      this.uploadImageParams.Key = `images/${filename}`
      await this.s3.upload(this.uploadImageParams).promise()
      filenames.push(
        `https://${this.uploadImageParams.Bucket}.${this.s3.endpoint.hostname}/images/${filename}`
      )
    }

    return filenames
  }
}
