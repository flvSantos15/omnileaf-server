import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeSave,
  column,
  HasMany,
  hasMany,
  HasOne,
  hasOne,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import { UserRoles } from 'Contracts/enums'
import TrackingSession from './TrackingSession'
import Project from './Project'
import Board from './Board'
import List from './List'
import Task from './Task'
import Screenshot from './Screenshot'
import Organization from './Organization'
import Hash from '@ioc:Adonis/Core/Hash'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column({ columnName: 'display_name' })
  public displayName: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column({ columnName: 'avatar_url' })
  public avatarUrl: string

  @column()
  public phone: string

  @column()
  public account_type: UserRoles

  @column({ columnName: 'latest_tracking_session_id' })
  public latestTrackingSessionId: string

  @column({ columnName: 'remember_me_token' })
  public rememberMeToken: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => TrackingSession, {
    foreignKey: 'userId',
  })
  public latestTrackingSession: HasOne<typeof TrackingSession>

  @hasMany(() => Project, {
    foreignKey: 'creator_id',
  })
  public ownedProjects: HasMany<typeof Project>

  @manyToMany(() => Project, {
    pivotTable: 'project_user',
    pivotColumns: ['user_role'],
  })
  public assignedProjects: ManyToMany<typeof Project>

  @hasMany(() => Board, {
    foreignKey: 'creator_id',
  })
  public ownedBoards: HasMany<typeof Board>

  @hasMany(() => List, {
    foreignKey: 'creator_id',
  })
  public ownedLists: HasMany<typeof List>

  @hasMany(() => Task, {
    foreignKey: 'creator_id',
  })
  public ownedTasks: HasMany<typeof Task>

  @manyToMany(() => Task, {
    pivotTable: 'task_user',
  })
  public assignedTasks: ManyToMany<typeof Task>

  @hasMany(() => Screenshot, {
    foreignKey: 'user_id',
  })
  public screenshots: HasMany<typeof Screenshot>

  @manyToMany(() => Organization, {
    pivotTable: 'organization_user',
    pivotColumns: ['member_role'],
  })
  public organizations: ManyToMany<typeof Organization>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  public serializeExtras() {
    return {
      projectRole: this.$extras.pivot_user_role,
      organizationRole: this.$extras.pivot_member_role,
    }
  }
}
