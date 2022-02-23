import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class IntegrationAssignPendences extends BaseSchema {
  protected tableName = 'integration_assign_pendences'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.uuid('task_id').unsigned().references('id').inTable('tasks').onDelete('CASCADE')
      table.string('jira_id')
      table.string('gitlab_id')

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
