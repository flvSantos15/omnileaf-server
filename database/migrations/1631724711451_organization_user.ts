import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class OrganizationUsers extends BaseSchema {
  protected tableName = 'organization_user'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table
        .uuid('organization_id')
        .unsigned()
        .references('id')
        .inTable('organizations')
        .notNullable()
      table.uuid('user_id').unsigned().references('id').inTable('users').notNullable()

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
