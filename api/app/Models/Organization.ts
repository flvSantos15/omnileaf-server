import { DateTime } from 'luxon'
import {
  afterCreate,
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  computed,
  HasMany,
  hasMany,
  HasOne,
  hasOne,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Project from './Project'
import Label from './Label'
import GitlabToken from './GitlabToken'
import JiraToken from './JiraToken'
import OrganizationUser from './OrganizationUser'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'
import { OrganizationLabels } from 'Contracts/enums'

export default class Organization extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public avatarUrl: string

  @column()
  public description: string

  @column()
  public creatorId: string

  @column()
  public gitlabId: number

  @column()
  public jiraId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get userLabels() {
    const relationLabels = this.memberRelations.map((relation) => relation.labels)[0]
    return relationLabels.map((label) => label.title)
  }

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

  @hasOne(() => GitlabToken, {
    foreignKey: 'organizationId',
  })
  public gitlabToken: HasOne<typeof GitlabToken>

  @hasOne(() => JiraToken, {
    foreignKey: 'organizationId',
  })
  public jiraToken: HasOne<typeof JiraToken>

  @hasMany(() => OrganizationUser, {
    foreignKey: 'organizationId',
    serializeAs: null,
  })
  public memberRelations: HasMany<typeof OrganizationUser>

  @afterCreate()
  public static async createLabelsAndAssignCreator(organization: Organization) {
    await organization.related('members').attach([organization.creatorId])

    const relation = await OrganizationUser.query()
      .where('organization_id', organization.id)
      .andWhere('user_id', organization.creatorId)
      .firstOrFail()

    Object.values(OrganizationLabels).map(async (lb) => {
      const label = await Label.create({ title: lb, organizationId: organization.id })
      if (lb === OrganizationLabels.OWNER) {
        await label.related('organizationUser').attach([relation.id])
      }
    })
  }
}
