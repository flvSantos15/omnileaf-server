import { DateTime } from 'luxon'
import { BaseModel, beforeSave, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { ManualEntryStatus } from 'Contracts/enums/manual-entry-status'
import Task from './Task'

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
  public startedDate: DateTime | string

  @column()
  public finishedDate: DateTime | string

  @column()
  public workedFrom: string

  @column()
  public workedTo: string

  @column()
  public reason: string

  @column()
  public status: ManualEntryStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static forceIsoDate(entry: ManualEntry) {
    if (entry.$dirty.startedDate) {
      const startedAsIsoDate = DateTime.fromISO(entry.startedDate.toString()).toISODate()

      entry.startedDate = startedAsIsoDate
    }

    if (entry.$dirty.finishedDate) {
      const finishedAsIsoDate = DateTime.fromISO(entry.startedDate.toString()).toISODate()

      entry.finishedDate = finishedAsIsoDate
    }
  }

  @belongsTo(() => Task, {
    foreignKey: 'taskId',
  })
  public task: BelongsTo<typeof Task>
}
