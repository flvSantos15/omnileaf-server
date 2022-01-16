import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeFetch,
  beforeFind,
  beforeSave,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
  ModelQueryBuilderContract,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Task from './Task'
import Tag from './Tag'
import Organization from './Organization'
import GitlabIntegrationService from 'App/Services/GitlabIntegration/GitlabIntegrationService'
import JiraIntegrationService from 'App/Services/JiraIntegration/JiraIntegrationService'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'

export default class Project extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public description?: string

  @column()
  public isDeleted: boolean

  @column()
  public creatorId?: string

  @column()
  public organizationId: string

  @column()
  public gitlabId?: number

  @column()
  public gitlabCreatorId?: number

  @column()
  public jiraId?: string

  @column()
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

  @beforeFind()
  public static ignoreDeletedOnFind(query: ModelQueryBuilderContract<typeof User>) {
    query.where('is_deleted', false)
  }

  @beforeFetch()
  public static ignoreDeletedOnFetch(query: ModelQueryBuilderContract<typeof User>) {
    query.where('is_deleted', false)
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
