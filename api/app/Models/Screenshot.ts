import { DateTime } from 'luxon'
import { afterCreate, BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Task from './Task'
import TrackingSession from './TrackingSession'
import { string } from '@ioc:Adonis/Core/Helpers'

export default class Screenshot extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public location: string

  @column()
  public blurredLocation: string

  @column({ columnName: 'deleted' })
  public isDeleted: boolean

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

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Task, {
    foreignKey: 'taskId',
  })
  public task: BelongsTo<typeof Task>

  @belongsTo(() => TrackingSession, {
    foreignKey: 'trackingSessionId',
  })
  public trackingSession: BelongsTo<typeof TrackingSession>

  @afterCreate()
  public static async saveScreenshotLocation(screenshot: Screenshot) {
    const location = 'images/' + screenshot.id + string.generateRandom(15)
    const blurredLocation = 'images/blurred/' + screenshot.id + string.generateRandom(15)

    screenshot.location = location
    screenshot.blurredLocation = blurredLocation
    await screenshot.save()
  }
}
