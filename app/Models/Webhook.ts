import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Webhook extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public projectId: string

  @column()
  public jiraId: string

  @column()
  public gitlabId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
