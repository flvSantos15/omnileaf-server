import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class GitlabToken extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'owner_id' })
  public ownerId: string

  @column({ columnName: 'organization_id' })
  public organizationId: string

  @column()
  public token: string

  @column({ columnName: 'refresh_token' })
  public refreshToken: string

  @column({ columnName: 'expires_in' })
  public expiresIn: number

  @column({ columnName: 'created_time' })
  public createdTime: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
