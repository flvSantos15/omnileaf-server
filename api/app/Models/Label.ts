import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import OrganizationUser from './OrganizationUser'
import { OrganizationLabels } from 'Contracts/enums'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'

export default class Label extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column()
  public title: OrganizationLabels

  @column()
  public organizationId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => OrganizationUser, {
    pivotTable: 'label_organization_user',
  })
  public organizationUser: ManyToMany<typeof OrganizationUser>
}
