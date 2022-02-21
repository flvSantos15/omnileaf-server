import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class InviteLabels extends BaseSchema {
  protected tableName = 'invite_label'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v4()')).notNullable()
      table
        .uuid('invite_id')
        .unsigned()
        .references('id')
        .inTable('organization_invites')
        .notNullable()
        .onDelete('CASCADE')
      table
        .uuid('label_id')
        .unsigned()
        .references('id')
        .inTable('labels')
        .notNullable()
        .onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
