import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Labels extends BaseSchema {
  protected tableName = 'labels'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.string('title').notNullable()
      table
        .uuid('organization_id')
        .unsigned()
        .references('id')
        .inTable('organizations')
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
