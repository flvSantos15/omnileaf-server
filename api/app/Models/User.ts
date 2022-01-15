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
import Task from './Task'
import Screenshot from './Screenshot'
import Organization from './Organization'
import Hash from '@ioc:Adonis/Core/Hash'
import OrganizationUser from './OrganizationUser'
import GitlabToken from './GitlabToken'
import JiraToken from './JiraToken'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'

export default class User extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public displayName: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public avatarUrl: string

  @column()
  public phone: string

  @column()
  public account_type: UserRoles

  @column()
  public latestTrackingSessionId: string

  @column()
  public rememberMeToken: string

  @column()
  public gitlabId: number

  @column()
  public jiraId: string

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
    pivotColumns: ['role'],
  })
  public assignedProjects: ManyToMany<typeof Project>

  @hasMany(() => Task, {
    foreignKey: 'creatorId',
  })
  public ownedTasks: HasMany<typeof Task>

  @hasMany(() => OrganizationUser, {
    foreignKey: 'userId',
  })
  public organizationRelations: HasMany<typeof OrganizationUser>

  @manyToMany(() => Task, {
    pivotTable: 'task_user',
  })
  public assignedTasks: ManyToMany<typeof Task>

  @hasMany(() => Screenshot, {
    foreignKey: 'userId',
  })
  public screenshots: HasMany<typeof Screenshot>

  @manyToMany(() => Organization, {
    pivotTable: 'organization_user',
  })
  public organizations: ManyToMany<typeof Organization>

  @hasOne(() => GitlabToken, {
    foreignKey: 'ownerId',
  })
  public gitlabToken: HasOne<typeof GitlabToken>

  @hasOne(() => JiraToken, {
    foreignKey: 'ownerId',
  })
  public jiraToken: HasOne<typeof JiraToken>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  public serializeExtras() {
    return {
      role: this.$extras.pivot_role,
    }
  }
}
