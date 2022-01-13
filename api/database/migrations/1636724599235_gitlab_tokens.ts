import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class GitlabTokens extends BaseSchema {
  protected tableName = 'gitlab_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.uuid('owner_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('organization_id').unsigned().references('id').inTable('organizations')
      table.string('token').notNullable()
      table.string('refresh_token').notNullable()
      table.integer('expires_in').notNullable()
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
