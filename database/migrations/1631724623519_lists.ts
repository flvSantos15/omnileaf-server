import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Lists extends BaseSchema {
  protected tableName = 'lists'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.string('name').notNullable()
      table.uuid('creator_id').unsigned().references('id').inTable('users').notNullable()
      table.uuid('board_id').unsigned().references('id').inTable('boards').notNullable()

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