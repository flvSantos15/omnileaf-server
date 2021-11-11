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
import Label from './Label'

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

  @hasMany(() => Project, {
    foreignKey: 'organizationId',
  })
  public projects: HasMany<typeof Project>

  @manyToMany(() => User, {
    pivotTable: 'organization_user',
  })
  public members: ManyToMany<typeof User>

  @hasMany(() => Label, {
    foreignKey: 'organizationId',
  })
  public labels: HasMany<typeof Label>
}
