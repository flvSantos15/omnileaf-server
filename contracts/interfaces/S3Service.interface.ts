export default interface S3ServiceInterface {
  uploadImage(buffer: Buffer): Promise<string>
  deleteImage(url: string): Promise<void>
}
