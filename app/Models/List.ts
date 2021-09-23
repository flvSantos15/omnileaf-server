import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
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

  @hasOne(() => User, {
    foreignKey: 'creator_id',
  })
  public creator: HasOne<typeof User>

  @hasOne(() => Board, {
    foreignKey: 'board_id',
  })
  public board: HasOne<typeof Board>

  @hasMany(() => Task, {
    foreignKey: 'list_id',
  })
  public tasks: HasMany<typeof Task>
}
