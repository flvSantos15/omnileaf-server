import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Board from './Board'
import Task from './Task'

export default class List extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column({ columnName: 'creator_id' })
  public creatorId: string

  @column({ columnName: 'board_id' })
  public boardId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'creatorId',
  })
  public creator: BelongsTo<typeof User>

  @belongsTo(() => Board, {
    foreignKey: 'boardId',
  })
  public board: BelongsTo<typeof Board>

  @hasMany(() => Task, {
    foreignKey: 'list_id',
  })
  public tasks: HasMany<typeof Task>
}
