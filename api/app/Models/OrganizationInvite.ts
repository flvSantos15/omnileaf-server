import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import { OrganizationInviteStatus } from 'Contracts/enums/organization-invite-status'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'
import Organization from './Organization'
import User from './User'

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

  @column({ serializeAs: null })
  public labelsString: string

  @column({ serializeAs: null })
  public projectsString: string

  @computed()
  public get labels() {
    return this.labelsString.split(';')
  }

  @computed()
  public get projects() {
    return this.projectsString.split(';')
  }

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
}
