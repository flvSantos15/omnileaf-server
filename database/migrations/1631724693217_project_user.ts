import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ProjectRoles } from 'Contracts/enums'

export default class ProjectUsers extends BaseSchema {
  protected tableName = 'project_user'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.uuid('project_id').unsigned().references('id').inTable('projects').notNullable()
      table.uuid('user_id').unsigned().references('id').inTable('users').notNullable()
      table.enum('user_role', Object.values(ProjectRoles)).notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
