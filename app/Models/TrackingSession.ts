import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { TrackingSessionStatus } from 'Contracts/enums'
import User from './User'
import Task from './Task'

export default class TrackingSession extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public status: TrackingSessionStatus

  @column({ columnName: 'user_id' })
  public userId: string

  @column({ columnName: 'task_id' })
  public taskId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, columnName: 'started_at' })
  public startedAt: DateTime

  @column.dateTime({ autoCreate: true, columnName: 'stopped_at' })
  public stoppedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Task, {
    foreignKey: 'taskId',
  })
  public task: BelongsTo<typeof Task>
}
