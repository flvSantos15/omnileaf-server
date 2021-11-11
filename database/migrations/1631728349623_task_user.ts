import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TaskUser extends BaseSchema {
  protected tableName = 'task_user'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table
        .uuid('task_id')
        .unsigned()
        .references('id')
        .inTable('tasks')
        .notNullable()
        .onDelete('CASCADE')
      table
        .uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .notNullable()
        .onDelete('CASCADE')

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
