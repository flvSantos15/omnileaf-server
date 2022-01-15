import Env from '@ioc:Adonis/Core/Env'
import { DateTime } from 'luxon'
import { afterCreate, BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Task from './Task'
import TrackingSession from './TrackingSession'
import { string } from '@ioc:Adonis/Core/Helpers'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'

export default class Screenshot extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column({
    serialize: (value: string) => {
      const adress = 'https://' + Env.get('SPACES_NAME') + '.' + Env.get('SPACES_ENDPOINT') + '/'

      return adress + value
    },
  })
  public location: string

  @column({
    serialize: (value: string) => {
      const adress = 'https://' + Env.get('SPACES_NAME') + '.' + Env.get('SPACES_ENDPOINT') + '/'

      return adress + value
    },
  })
  public blurredLocation: string

  @column({ columnName: 'deleted' })
  public isDeleted: boolean

  @column()
  public userId: string

  @column()
  public taskId: string

  @column()
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
    if (!screenshot.location && !screenshot.blurredLocation) {
      const location =
        Env.get('NODE_ENV') === 'development'
          ? 'dev'
          : '' + 'images/' + screenshot.id + string.generateRandom(15)
      const blurredLocation =
        Env.get('NODE_ENV') === 'development'
          ? 'dev'
          : '' + 'images/blurred/' + screenshot.id + string.generateRandom(15)

      screenshot.location = location
      screenshot.blurredLocation = blurredLocation
      await screenshot.save()
    }
  }
}
