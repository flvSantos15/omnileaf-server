import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class JiraToken extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'owner_id' })
  public ownerId: string

  @column({ columnName: 'organization_id' })
  public organizationId: string

  @column({ columnName: 'access_token' })
  public token: string

  @column({ columnName: 'refresh_token' })
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
}
