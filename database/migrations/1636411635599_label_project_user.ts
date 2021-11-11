import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class LabelProjectusers extends BaseSchema {
  protected tableName = 'label_project_user'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table
        .uuid('label_id')
        .unsigned()
        .references('id')
        .inTable('labels')
        .notNullable()
        .onDelete('CASCADE')
      table
        .uuid('project_user_id')
        .unsigned()
        .references('id')
        .inTable('project_user')
        .notNullable()
        .onDelete('CASCADE')

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
