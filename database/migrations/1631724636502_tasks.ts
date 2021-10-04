import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tasks extends BaseSchema {
  protected tableName = 'tasks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.string('name').notNullable()
      table.string('body')
      table.integer('time_estimated')
      table.uuid('creator_id').unsigned().references('id').inTable('users').notNullable()
      table.uuid('project_id').unsigned().references('id').inTable('projects').notNullable()
      table.uuid('list_id').unsigned().references('id').inTable('lists').notNullable()

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
