import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import Encryption from '@ioc:Adonis/Core/Encryption'

export default class GitlabToken extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'owner_id' })
  public ownerId: string

  @column({ columnName: 'organization_id' })
  public organizationId: string

  @column({
    serialize: (value: string) => {
      return Encryption.decrypt(value)
    },
  })
  public token: string

  @column({
    columnName: 'refresh_token',
    serialize: (value: string) => {
      return Encryption.decrypt(value)
    },
  })
  public refreshToken: string

  @column({ columnName: 'expires_in' })
  public expiresIn: number

  @column({ columnName: 'created_time' })
  public createdTime: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(token: GitlabToken) {
    token.token = Encryption.encrypt(token.token)
    token.refreshToken = Encryption.encrypt(token.refreshToken)
  }
}
