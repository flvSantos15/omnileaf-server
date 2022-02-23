import { DateTime } from 'luxon'
import { afterFind, BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import Encryption from '@ioc:Adonis/Core/Encryption'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'

export default class JiraToken extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column()
  public ownerId: string

  @column()
  public organizationId: string

  @column({
    serialize: (value: string) => {
      return Encryption.decrypt(value)
    },
  })
  public token: string

  @column({
    serialize: (value: string) => {
      return Encryption.decrypt(value)
    },
  })
  public refreshToken: string

  @column()
  public expiresIn: number

  @column()
  public scope: string

  @column()
  public createdTime: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async encryptToken(token: JiraToken) {
    if (token.$dirty.token) {
      token.token = Encryption.encrypt(token.token)
    }
    if (token.$dirty.refreshToken) {
      token.refreshToken = Encryption.encrypt(token.refreshToken)
    }
  }

  @afterFind()
  public static serializeToken(token: JiraToken) {
    return token.serialize()
  }
}
