import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Boards extends BaseSchema {
  protected tableName = 'boards'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.uuid('creator_id').unsigned().references('id').inTable('users').notNullable()
      table.uuid('project_id').unsigned().references('id').inTable('projects').notNullable()
      table.string('name').notNullable()

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