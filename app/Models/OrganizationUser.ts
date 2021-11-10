import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Label from './Label'

export default class OrganizationUser extends BaseModel {
  public static table = 'organization_user'

  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'user_id' })
  public userId: string

  @column({ columnName: 'organization_id' })
  public organizationId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Label, {
    pivotTable: 'label_organization_user',
  })
  public labels: ManyToMany<typeof Label>
}
