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
import { UserRoles } from 'Contracts/enums'
import Project from './Project'
import Task from './Task'
import Screenshot from './Screenshot'
import Organization from './Organization'
import OrganizationUser from './OrganizationUser'
import GitlabToken from './GitlabToken'
import JiraToken from './JiraToken'

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

  @column({ columnName: 'gitlab_id' })
  public gitlabId: number

  @column({ columnName: 'jira_id' })
  public jiraId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

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
}
