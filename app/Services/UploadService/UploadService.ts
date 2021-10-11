import AWS from 'aws-sdk'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import { PutObjectRequest } from 'aws-sdk/clients/s3'

export default class UploadService {
  protected originalImageLocation: string
  protected s3: AWS.S3
  protected uploadImageParams: PutObjectRequest
  protected logger: typeof Logger

  constructor() {
    this.s3 = new AWS.S3({
      endpoint: new AWS.Endpoint(Env.get('SPACES_ENDPOINT')),
      accessKeyId: Env.get('ACCESS_KEY_ID'),
      secretAccessKey: Env.get('SECRET_ACCESS_KEY'),
    })

    this.uploadImageParams = {
      Bucket: 'omnileaf',
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/jpg`,
      Key: '',
      Body: '',
    }

    this.logger = Logger
  }
}
