import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { TrackingSessionStatus } from 'Contracts/enums'
import { TrackingSessionType } from 'Contracts/enums/tracking-session-type'

export default class TrackingSessions extends BaseSchema {
  protected tableName = 'tracking_sessions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()

      table
        .enum('status', Object.values(TrackingSessionStatus))
        .defaultTo(TrackingSessionStatus.IN_PROGRESS)
        .notNullable()

      table
        .enum('type', Object.values(TrackingSessionType), {
          useNative: true,
          enumName: 'tracking_session_type',
          existingType: false,
        })
        .defaultTo(TrackingSessionType.SYSTEM).notNullable

      table.integer('tracking_time')

      table
        .uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .notNullable()
        .onDelete('CASCADE')

      table
        .uuid('organization_id')
        .unsigned()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')

      table
        .uuid('project_id')
        .unsigned()
        .references('id')
        .inTable('projects')
        .notNullable()
        .onDelete('CASCADE')

      table
        .uuid('task_id')
        .unsigned()
        .references('id')
        .inTable('tasks')
        .notNullable()
        .onDelete('CASCADE')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })

      table.timestamp('started_at', { useTz: true })

      table.timestamp('stopped_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS "tracking_session_type"')
  }
}
