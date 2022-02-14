import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
} from '@ioc:Adonis/Lucid/Orm'
import { TrackingSessionStatus } from 'Contracts/enums'
import User from './User'
import Task from './Task'
import Screenshot from './Screenshot'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'
import Project from './Project'
import { TrackingSessionType } from 'Contracts/enums/tracking-session-type'

export default class TrackingSession extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column()
  public status: TrackingSessionStatus

  @column()
  public type: TrackingSessionType

  @column()
  public trackingTime: number

  @column()
  public inactivityTime: number

  @column()
  public userId: string

  //This property is auto created on beforeCreate hook
  @column()
  public organizationId: string

  //This property is auto created on beforeCreate hook
  @column()
  public projectId: string

  @column()
  public taskId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, columnName: 'started_at' })
  public startedAt: DateTime

  @column()
  public stoppedAt: DateTime

  //Relations
  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Project, {
    foreignKey: 'projectId',
  })
  public project: BelongsTo<typeof Project>

  @belongsTo(() => Task, {
    foreignKey: 'taskId',
  })
  public task: BelongsTo<typeof Task>

  @hasMany(() => Screenshot, {
    foreignKey: 'trackingSessionId',
  })
  public screenshots: HasMany<typeof Screenshot>

  @beforeCreate()
  public static async addProjectAndOrganizationIds(trackingSession: TrackingSession) {
    const task = await Task.findOrFail(trackingSession.taskId)

    trackingSession.merge({ projectId: task.projectId, organizationId: task.organizationId })
  }
}
