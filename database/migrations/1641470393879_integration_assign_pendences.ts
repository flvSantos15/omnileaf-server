import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class IntegrationAssignPendences extends BaseSchema {
  protected tableName = 'integration_assign_pendences'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.uuid('id').unsigned().references('id').inTable('tasks').onDelete('CASCADE')
      table.string('jiraId')
      table.string('gitlabId')

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
