import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddTrackingSessionToUser extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .uuid('latest_tracking_session_id')
        .unsigned()
        .references('id')
        .inTable('tracking_sessions')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('latest_tracking_session_id')
    })
  }
}
