import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ResetPasswordTokens extends BaseSchema {
  protected tableName = 'reset_password_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().defaultTo(this.raw('uuid_generate_v1()')).notNullable()
      table
        .string('user_email')
        .unique()
        .unsigned()
        .references('email')
        .inTable('users')
        .notNullable()
      table.string('expires_in').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
