import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
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

  @hasOne(() => User, {
    foreignKey: 'user_id',
  })
  public user: HasOne<typeof User>

  @hasOne(() => Task, {
    foreignKey: 'task_id',
  })
  public task: HasOne<typeof Task>
}
