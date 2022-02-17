import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import { OrganizationInviteStatus } from 'Contracts/enums/organization-invite-status'
import Organization from './Organization'
import User from './User'

export default class OrganizationInvite extends BaseModel {
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

  @computed()
  public get labels() {
    return this.labelsString.split(';')
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
