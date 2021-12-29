import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tasks extends BaseSchema {
  protected tableName = 'tasks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.string('name').notNullable()
      table.text('body')
      table.integer('time_estimated')
      table.uuid('creator_id').unsigned().references('id').inTable('users')
      table
        .uuid('project_id')
        .unsigned()
        .references('id')
        .inTable('projects')
        .notNullable()
        .onDelete('CASCADE')
      table.uuid('list_id').unsigned().references('id').inTable('lists')
      table.integer('gitlab_id')
      table.integer('gitlab_creator_id')

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
