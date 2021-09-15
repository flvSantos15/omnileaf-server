import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TaskTags extends BaseSchema {
  protected tableName = 'task_tag'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.uuid('task_id').unsigned().references('id').inTable('tasks').notNullable()
      table.uuid('tag_id').unsigned().references('id').inTable('tags').notNullable()

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
