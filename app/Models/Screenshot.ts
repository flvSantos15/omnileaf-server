import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Task from './Task'

export default class Screenshot extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public url: string

  @column()
  public height: number

  @column()
  public widh: number

  @column({ columnName: 'thumbnail_url' })
  public thumbnailUrl: string

  @column()
  public blurhash: string

  @column()
  public deleted: boolean

  @column({ columnName: 'user_id' })
  public userId: string

  @column({ columnName: 'task_id' })
  public taskId: string

  @column({ columnName: 'tracking_session_id' })
  public trackingSessionId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => User, {
    foreignKey: 'user_id',
  })
  public user: HasOne<typeof User>

  @hasOne(() => Task, {
    foreignKey: 'task_id',
  })
  public task: HasOne<typeof Task>
}
