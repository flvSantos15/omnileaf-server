import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import ProjectUser from './ProjectUser'

export default class Label extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public title: string

  @column({ columnName: 'organization_id' })
  public organizationId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => ProjectUser, {
    pivotTable: 'label_projectusers',
  })
  public projectUser: ManyToMany<typeof ProjectUser>
}
