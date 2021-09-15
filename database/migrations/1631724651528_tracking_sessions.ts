import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { TrackingSessionStatus } from 'Contracts/enums'

export default class TrackingSessions extends BaseSchema {
  protected tableName = 'tracking_sessions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table
        .enum('status', Object.values(TrackingSessionStatus))
        .defaultTo(TrackingSessionStatus.IN_PROGRESS)
        .notNullable()
      table.uuid('user_id').unsigned().references('id').inTable('users').notNullable()
      table.uuid('task_id').unsigned().references('id').inTable('tasks').notNullable()

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
