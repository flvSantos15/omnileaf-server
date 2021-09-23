import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Project from './Project'
import List from './List'

export default class Board extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column({ columnName: 'creator_id' })
  public creatorId: string

  @column({ columnName: 'project_id' })
  public projectId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => User, {
    foreignKey: 'creator_id',
  })
  public creator: HasOne<typeof User>

  @hasOne(() => Project, {
    foreignKey: 'project_id',
  })
  public project: HasOne<typeof Project>

  @hasMany(() => List, {
    foreignKey: 'board_id',
  })
  public lists: HasMany<typeof List>
}
