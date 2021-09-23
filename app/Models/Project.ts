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
import Board from './Board'
import Task from './Task'
import Tag from './Tag'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column({ columnName: 'creator_id' })
  public creatorId: string

  @column({ columnName: 'user_in_charge_id' })
  public userInChargeId: string

  @column()
  public description: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => User, {
    foreignKey: 'creator_id',
  })
  public owner: HasOne<typeof User>

  @hasOne(() => User, {
    foreignKey: 'user_in_charge_id',
  })
  public userInCharge: HasOne<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'project_user',
  })
  public participants: ManyToMany<typeof User>

  @hasMany(() => Board, {
    foreignKey: 'project_id',
  })
  public boards: HasMany<typeof Board>

  @hasMany(() => Task, {
    foreignKey: 'project_id',
  })
  public tasks: HasMany<typeof Task>

  @hasMany(() => Tag, {
    foreignKey: 'project_id',
  })
  public tags: HasMany<typeof Tag>
}
