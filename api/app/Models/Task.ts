import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeFetch,
  beforeFind,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
  ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Project from './Project'
import Screenshot from './Screenshot'
import Tag from './Tag'
import TrackingSession from './TrackingSession'
import { TaskStatus } from 'Contracts/enums'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'

export default class Task extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public body?: string

  @column()
  public timeEstimated: number

  @column()
  public links?: string

  @column()
  public creatorId?: string

  @column()
  public projectId: string

  @column()
  public status: TaskStatus

  @column()
  public isDeleted: boolean

  @column()
  public gitlabId?: number

  @column()
  public gitlabCreatorId?: number

  @column()
  public jiraId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'creatorId',
  })
  public creator: BelongsTo<typeof User>

  @belongsTo(() => Project, {
    foreignKey: 'projectId',
  })
  public project: BelongsTo<typeof Project>

  @manyToMany(() => User, {
    pivotTable: 'task_user',
  })
  public usersAssigned: ManyToMany<typeof User>

  @hasMany(() => Screenshot, {
    foreignKey: 'taskId',
  })
  public screenshots: HasMany<typeof Screenshot>

  @manyToMany(() => Tag, {
    pivotTable: 'task_tag',
  })
  public tags: ManyToMany<typeof Tag>

  @hasMany(() => TrackingSession, {
    foreignKey: 'taskId',
  })
  public trackingSessions: HasMany<typeof TrackingSession>

  @beforeFind()
  public static ignoreDeletedOnFind(query: ModelQueryBuilderContract<typeof User>) {
    query.where('is_deleted', false)
  }

  @beforeFetch()
  public static ignoreDeletedOnFetch(query: ModelQueryBuilderContract<typeof User>) {
    query.where('is_deleted', false)
  }
}
