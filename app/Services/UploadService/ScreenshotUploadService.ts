import Jimp from 'jimp'
import sizeOf from 'image-size'
import ImageUploadService from './ImageUploadService'

export default class ScreenshotUploadService extends ImageUploadService {
  protected async executeClass() {
    // Generate minified Buffer from Original Image
    const minifiedBuffer = await this.compressImages()

    //Save buffer to file with Jimp
    const buffers = await this.generateUploadableFiles(minifiedBuffer)

    const filenames = await this.uploadToSpaces(buffers)

    return filenames
  }

  protected async generateUploadableFiles(buffer: Buffer) {
    const image = await Jimp.read(buffer)
    const blurredImage = await Jimp.read(buffer)
    const imageDimensions = sizeOf(buffer)

    return [
      await image.resize(imageDimensions.width! * 0.7, Jimp.AUTO).getBufferAsync('image/jpeg'),
      await blurredImage
        .resize(imageDimensions.width! * 0.7, Jimp.AUTO)
        .blur(10)
        .getBufferAsync('image/jpeg'),
    ]
  }
}
