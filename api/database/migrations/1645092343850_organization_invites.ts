import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { OrganizationInviteStatus } from 'Contracts/enums/organization-invite-status'

export default class OrganizationInvites extends BaseSchema {
  protected tableName = 'organization_invites'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()

      table
        .uuid('organization_id')
        .unsigned()
        .references('id')
        .inTable('organizations')
        .notNullable()

      table.string('user_email').notNullable()

      table
        .enum('status', Object.values(OrganizationInviteStatus))
        .notNullable()
        .defaultTo(OrganizationInviteStatus.IN_PROGRESS)

      table.text('labels_string').notNullable()

      table.text('projects_string')

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
