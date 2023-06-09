import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Screenshots extends BaseSchema {
  protected tableName = 'screenshots'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.string('location')
      table.string('blurred_location')
      table.boolean('deleted').notNullable().defaultTo(false)
      table
        .uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .notNullable()
        .onDelete('CASCADE')
      table
        .uuid('project_id')
        .unsigned()
        .references('id')
        .inTable('projects')
        .notNullable()
        .onDelete('CASCADE')
      table
        .uuid('task_id')
        .unsigned()
        .references('id')
        .inTable('tasks')
        .notNullable()
        .onDelete('CASCADE')
      table
        .uuid('tracking_session_id')
        .unsigned()
        .references('id')
        .inTable('tracking_sessions')
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
