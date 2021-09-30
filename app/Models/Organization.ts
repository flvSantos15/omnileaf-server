import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Organization extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column({ columnName: 'avatar_url' })
  public avatarUrl: string

  @column()
  public description: string

  @column({ columnName: 'creator_id' })
  public creatorId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'creatorId',
  })
  public creator: BelongsTo<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'organization_user',
    pivotColumns: ['member_type'],
  })
  public members: ManyToMany<typeof User>
}
