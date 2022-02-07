import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ManualEntry extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public taskId: string

  @column()
  public trackingSessionId: string

  @column()
  public startedDate: string

  @column()
  public finishedDate: string

  @column()
  public workedFrom: string

  @column()
  public workedTo: string

  @column()
  public reason: string

  @column()
  public isApproved: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
