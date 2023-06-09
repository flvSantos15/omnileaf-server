import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Projects extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.string('name').notNullable()
      table.string('description')
      table.string('avatar_url')
      table.boolean('is_deleted').defaultTo(false)
      table.uuid('creator_id').unsigned().references('id').inTable('users')
      table.uuid('client_id').unsigned().references('id').inTable('users')
      table
        .uuid('organization_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('organizations')
        .notNullable()
        .onDelete('CASCADE')
      table.integer('gitlab_id')
      table.integer('gitlab_creator_id')
      table.string('jira_id')
      table.string('jira_creator_id')

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
