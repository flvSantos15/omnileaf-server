import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { ManualEntryStatus } from 'Contracts/enums/manual-entry-status'

export default class ManualEntries extends BaseSchema {
  protected tableName = 'manual_entries'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table
        .uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table
        .uuid('task_id')
        .unsigned()
        .references('id')
        .inTable('tasks')
        .onDelete('CASCADE')
        .notNullable()
      table.uuid('tracking_session_id').unsigned().references('id').inTable('tracking_sessions')
      table.string('started_date').notNullable()
      table.string('finished_date').notNullable()
      table.string('worked_from').notNullable()
      table.string('worked_to').notNullable()
      table.text('reason')
      table
        .enum('status', Object.values(ManualEntryStatus), {
          useNative: true,
          enumName: 'manual_entry_status',
          existingType: false,
        })
        .defaultTo(ManualEntryStatus.IN_PROGRESS)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS "manual_entry_status"')
  }
}
