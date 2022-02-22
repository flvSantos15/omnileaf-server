/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'
import { ConnectionConfig } from '@ioc:Adonis/Lucid/Database'

interface CustomDatabaseConfig extends Omit<DatabaseConfig, 'connections'> {
  connections: {
    [key: string]: ConnectionConfig | any
  }
}

const databaseConfig: CustomDatabaseConfig = {
  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | The primary connection for making database queries across the application
  | You can use any key from the `connections` object defined in this same
  | file.
  |
  */
  connection: Env.get('DB_CONNECTION'),

  connections: {
    /*
    |--------------------------------------------------------------------------
    | PostgreSQL config
    |--------------------------------------------------------------------------
    |
    | Configuration for PostgreSQL database. Make sure to install the driver
    | from npm when using this connection
    |
    | npm i pg
    |
    */
    pg: {
      client: Env.get('DB_CONNECTION'),
      connection: {
        host: Env.get('DB_HOST'),
        port: Env.get('DB_PORT'),
        user: Env.get('DB_USER'),
        password: Env.get('DB_PASSWORD', ''),
        database: Env.get('DB_NAME'),
      },
      migrations: {
        naturalSort: true,
        tableName: 'adonis_schema',
      },
      healthCheck: true,
      debug: false,
      pool: {
        acquireTimeoutMillis: 60 * 2000,
        min: 2,
        max: 20,
      },
    },
  },
}

export default databaseConfig
