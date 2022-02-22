import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import add from 'date-fns/add'
import { createDateAsUTC } from 'App/Utils/CreateDateAsUTC'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'

export default class ResetPasswordToken extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column()
  public userEmail: string

  @column()
  public expiresIn: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static generateExpirationTime(resetPasswordToken: ResetPasswordToken) {
    resetPasswordToken.expiresIn = add(createDateAsUTC(new Date()), { minutes: 20 }).toISOString()
  }
}
