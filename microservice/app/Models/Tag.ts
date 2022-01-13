import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Project from './Project'
import Task from './Task'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public color: string

  @column({ columnName: 'project_id' })
  public projectId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => Project, {
    foreignKey: 'project_id',
  })
  public project: HasOne<typeof Project>

  @manyToMany(() => Task, {
    pivotTable: 'task_tag',
  })
  public tasks: ManyToMany<typeof Task>
}
