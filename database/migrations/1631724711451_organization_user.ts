import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { OrganizationRoles } from 'Contracts/enums'

export default class OrganizationUsers extends BaseSchema {
  protected tableName = 'organization_user'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table
        .uuid('organization_id')
        .unsigned()
        .references('id')
        .inTable('organizations')
        .notNullable()
      table.uuid('user_id').unsigned().references('id').inTable('users').notNullable()
      table.enum('member_role', Object.values(OrganizationRoles)).notNullable()

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
