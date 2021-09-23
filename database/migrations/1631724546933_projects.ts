import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Projects extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.string('name').notNullable()
      table.string('description')
      table
        .uuid('creator_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .notNullable()
      table
        .uuid('user_in_charge_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .notNullable()

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
