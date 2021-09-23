import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  HasMany,
  hasMany,
  HasOne,
  hasOne,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Project from './Project'
import List from './List'
import Screenshot from './Screenshot'
import Tag from './Tag'

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public body: string

  @column()
  public time_estimated: number

  @column()
  public links: string

  @column({ columnName: 'creator_id' })
  public creatorId: string

  @column({ columnName: 'project_id' })
  public projectId: string

  @column({ columnName: 'list_id' })
  public listId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => User, {
    foreignKey: 'creator_id',
  })
  public creator: HasOne<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'task_user',
  })
  public usersAssigned: ManyToMany<typeof User>

  @hasOne(() => Project, {
    foreignKey: 'project_id',
  })
  public project: HasOne<typeof Project>

  @hasOne(() => List, {
    foreignKey: 'list_id',
  })
  public list: HasOne<typeof List>

  @hasMany(() => Screenshot, {
    foreignKey: 'task_id',
  })
  public screenshots: HasMany<typeof Screenshot>

  @manyToMany(() => Tag, {
    pivotTable: 'task_tag',
  })
  public tags: ManyToMany<typeof Tag>
}
