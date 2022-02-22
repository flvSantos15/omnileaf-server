import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class InviteProjects extends BaseSchema {
  protected tableName = 'invite_project'

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
        .uuid('project_id')
        .unsigned()
        .references('id')
        .inTable('projects')
        .notNullable()
        .onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
