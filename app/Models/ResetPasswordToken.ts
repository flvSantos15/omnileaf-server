import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import add from 'date-fns/add'
import { createDateAsUTC } from 'App/Utils/CreateDateAsUTC'

export default class ResetPasswordToken extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'user_email' })
  public userEmail: string

  @column({ columnName: 'expires_in' })
  public expiresIn: string

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static generateExpirationTime(resetPasswordToken: ResetPasswordToken) {
    resetPasswordToken.expiresIn = add(createDateAsUTC(new Date()), { minutes: 20 }).toISOString()
  }
}
