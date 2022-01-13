import AWS from 'aws-sdk'
import Env from '@ioc:Adonis/Core/Env'
import { PutObjectRequest } from 'aws-sdk/clients/s3'
import { string } from '@ioc:Adonis/Core/Helpers'
import S3ServiceInterface from 'Contracts/interfaces/S3Service.interface'

export default class S3Service implements S3ServiceInterface {
  private s3: AWS.S3
  private uploadImageParams: PutObjectRequest

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
      ContentType: `image/png`,
      Key: '',
      Body: '',
    }
  }

  public async uploadImage(buffer: Buffer) {
    const filename = string.generateRandom(40)
    this.uploadImageParams.Body = buffer
    this.uploadImageParams.Key = `images/${filename}`
    await this.s3.upload(this.uploadImageParams).promise()

    return `https://${this.uploadImageParams.Bucket}.${this.s3.endpoint.hostname}/images/${filename}`
  }

  public async deleteImage(url: string) {
    const Key = url.replace(
      `https://${this.uploadImageParams.Bucket}.${this.s3.endpoint.hostname}/`,
      ''
    )
    const params = {
      Bucket: this.uploadImageParams.Bucket,
      Key,
    }
    await this.s3.deleteObject(params).promise()
  }
}
