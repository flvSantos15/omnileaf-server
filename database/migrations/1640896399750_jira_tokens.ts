import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class JiraTokens extends BaseSchema {
  protected tableName = 'jira_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.uuid('owner_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('organization_id').unsigned().references('id').inTable('organizations')
      table.text('access_token').notNullable()
      table.text('refresh_token').notNullable()
      table.integer('expires_in').notNullable()
      table.string('scope').notNullable()
      table.integer('created_time').notNullable()
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
