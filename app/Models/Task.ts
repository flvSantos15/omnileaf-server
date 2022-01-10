import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Project from './Project'
import List from './List'
import Screenshot from './Screenshot'
import Tag from './Tag'
import TrackingSession from './TrackingSession'
import { TaskStatus } from 'Contracts/enums'

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public body?: string

  @column({ columnName: 'time_estimated' })
  public timeEstimated: number

  @column()
  public links?: string

  @column({ columnName: 'creator_id' })
  public creatorId?: string

  @column({ columnName: 'project_id' })
  public projectId: string

  @column()
  public status: TaskStatus

  @column()
  public isDeleted: boolean

  @column({ columnName: 'list_id' })
  public listId?: string

  @column({ columnName: 'gitlab_id' })
  public gitlabId?: number

  @column({ columnName: 'gitlab_creator_id' })
  public gitlabCreatorId?: number

  @column({ columnName: 'jira_id' })
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

  @belongsTo(() => List, {
    foreignKey: 'listId',
  })
  public list: BelongsTo<typeof List>

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
}
