export default interface S3ServiceInterface {
  uploadImage(filePath: string, buffer: Buffer): Promise<void>
  deleteImage(filePath: string): Promise<void>
}
