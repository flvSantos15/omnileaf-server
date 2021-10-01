import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Board from './Board'
import Task from './Task'
import Tag from './Tag'
import Organization from './Organization'
import List from './List'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public description: string

  @column({ columnName: 'creator_id' })
  public creatorId: string

  @column({ columnName: 'user_in_charge_id' })
  public userInChargeId: string

  @column({ columnName: 'organization_id' })
  public organizationId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'creatorId',
  })
  public owner: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'userInChargeId',
  })
  public userInCharge: BelongsTo<typeof User>

  @belongsTo(() => Organization, {
    foreignKey: 'organizationId',
  })
  public organization: BelongsTo<typeof Organization>

  @manyToMany(() => User, {
    pivotTable: 'project_user',
    pivotColumns: ['user_role'],
  })
  public usersAssigned: ManyToMany<typeof User>

  @hasMany(() => Board, {
    foreignKey: 'project_id',
  })
  public boards: HasMany<typeof Board>

  @hasMany(() => List, {
    foreignKey: 'project_id',
  })
  public lists: HasMany<typeof List>

  @hasMany(() => Task, {
    foreignKey: 'project_id',
  })
  public tasks: HasMany<typeof Task>

  @hasMany(() => Tag, {
    foreignKey: 'project_id',
  })
  public tags: HasMany<typeof Tag>

  @beforeCreate()
  public static async ifNotUserInCharge(project: Project) {
    if (!project.userInChargeId) {
      project.userInChargeId = project.creatorId
    }
  }

  public serializeExtras() {
    return {}
  }
}
