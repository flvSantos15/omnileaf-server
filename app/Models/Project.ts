import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeSave,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
  ModelObject,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Board from './Board'
import Task from './Task'
import Tag from './Tag'
import Organization from './Organization'
import GitlabIntegrationService from 'App/Services/GitlabIntegration/GitlabIntegrationService'
import JiraIntegrationService from 'App/Services/JiraIntegration/JiraIntegrationService'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public description?: string

  @column()
  public isDeleted: boolean

  @column({ columnName: 'creator_id' })
  public creatorId?: string

  @column({ columnName: 'organization_id' })
  public organizationId: string

  @column({ columnName: 'gitlab_id' })
  public gitlabId?: number

  @column({ columnName: 'gitlab_creator_id' })
  public gitlabCreatorId?: number

  @column({ columnName: 'jira_id' })
  public jiraId?: string

  @column({ columnName: 'jira_creator_id' })
  public jiraCreatorId?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'creatorId',
  })
  public owner: BelongsTo<typeof User>

  @belongsTo(() => Organization, {
    foreignKey: 'organizationId',
  })
  public organization: BelongsTo<typeof Organization>

  @manyToMany(() => User, {
    pivotTable: 'project_user',
    pivotColumns: ['role'],
  })
  public usersAssigned: ManyToMany<typeof User>

  @hasMany(() => Board, {
    foreignKey: 'projectId',
  })
  public boards: HasMany<typeof Board>

  @hasMany(() => Task, {
    foreignKey: 'projectId',
  })
  public tasks: HasMany<typeof Task>

  @hasMany(() => Tag, {
    foreignKey: 'projectId',
  })
  public tags: HasMany<typeof Tag>

  public serializeExtras() {
    return {
      role: this.$extras.pivot_role,
    }
  }

  @beforeSave()
  public static async handleDeleteProject(project: Project) {
    if (!project.$dirty.isDeleted) return
    if (project.gitlabId) {
      await GitlabIntegrationService.deleteProjectWebhooks(project)
    }

    if (project.jiraId) {
      await JiraIntegrationService.deleteProjectWebhooks(project)
    }

    await Task.query().where('projectId', project.id).update({ isDeleted: true })
  }
}
