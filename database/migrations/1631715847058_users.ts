import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { UserRoles } from 'Contracts/enums'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.defer(async () => {
      await this.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    })
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().unique().notNullable()
      table.string('name').notNullable()
      table.string('displayName').notNullable()
      table.string('email').unique().notNullable()
      table.string('avatar_url')
      table.string('phone')
      table.string('time_zone')
      table
        .enum('account_type', Object.values(UserRoles))
        .defaultTo(UserRoles.PRODUCTION)
        .notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
