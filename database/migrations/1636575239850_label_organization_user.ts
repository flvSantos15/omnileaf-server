import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class LabelsOrganizationUser extends BaseSchema {
  protected tableName = 'label_organization_user'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table.uuid('label_id').unsigned().references('id').inTable('labels').notNullable()
      table
        .uuid('organization_user_id')
        .unsigned()
        .references('id')
        .inTable('organization_user')
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
