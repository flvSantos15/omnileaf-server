import { DateTime } from 'luxon'
import { BaseModel, column, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Label from './Label'

export default class ProjectUser extends BaseModel {
  public static table = 'project_user'

  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'user_id' })
  public userId: string

  @column({ columnName: 'project_id' })
  public projectId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Label, {
    pivotTable: 'label_project_user',
  })
  public labels: ManyToMany<typeof Label>
}
