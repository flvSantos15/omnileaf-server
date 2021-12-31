import { DateTime } from 'luxon'
import { afterFind, BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import Encryption from '@ioc:Adonis/Core/Encryption'

export default class JiraToken extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'owner_id' })
  public ownerId: string

  @column({ columnName: 'organization_id' })
  public organizationId: string

  @column({
    columnName: 'access_token',
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

  @column()
  public scope: string

  @column({ columnName: 'created_time' })
  public createdTime: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(token: JiraToken) {
    token.token = Encryption.encrypt(token.token)
    token.refreshToken = Encryption.encrypt(token.refreshToken)
  }

  @afterFind()
  public static serializeToken(token: JiraToken) {
    return token.serialize()
  }
}
