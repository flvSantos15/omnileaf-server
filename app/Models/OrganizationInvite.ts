import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import { OrganizationInviteStatus } from 'Contracts/enums/organization-invite-status'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'
import Organization from './Organization'
import User from './User'
import Label from './Label'
import Project from './Project'

export default class OrganizationInvite extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column()
  public organizationId: string

  @column()
  public userEmail: string

  @column()
  public status: OrganizationInviteStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  /**
   *
   * Relations
   */
  @belongsTo(() => Organization, {
    foreignKey: 'organizationId',
  })
  public organization: BelongsTo<typeof Organization>

  @belongsTo(() => User, {
    foreignKey: 'userEmail',
  })
  public user: BelongsTo<typeof User>

  @manyToMany(() => Label, {
    pivotTable: 'invite_label',
    pivotForeignKey: 'invite_id',
  })
  public labels: ManyToMany<typeof Label>

  @manyToMany(() => Project, {
    pivotTable: 'invite_project',
    pivotForeignKey: 'invite_id',
  })
  public projects: ManyToMany<typeof Project>
}
