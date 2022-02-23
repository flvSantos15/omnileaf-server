import { DateTime } from 'luxon'
import { BaseModel, column, HasOne, hasOne, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Project from './Project'
import Task from './Task'
import { CamelCaseNamingStrategy } from 'App/Bindings/NamingStrategy'

export default class Tag extends BaseModel {
  public static namingStrategy = new CamelCaseNamingStrategy()

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public color: string

  @column()
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
