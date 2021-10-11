import { PutObjectRequest } from 'aws-sdk/clients/s3'
import UploadService from './UploadService'
import Logger from '@ioc:Adonis/Core/Logger'

export default class RemoveImageService extends UploadService {
  protected s3: AWS.S3
  protected uploadImageParams: PutObjectRequest
  protected logger: typeof Logger

  public async execute(url: string) {
    const Key = url.replace(
      `https://${this.uploadImageParams.Bucket}.${this.s3.endpoint.hostname}/`,
      ''
    )
    const params = {
      Bucket: this.uploadImageParams.Bucket,
      Key,
    }
    await this.s3.deleteObject(params).promise()

    this.logger.info('Image succesfully deleted from cloud storage.')
  }
}
