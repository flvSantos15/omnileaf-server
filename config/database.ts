/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'
import { ConnectionConfig } from '@ioc:Adonis/Lucid/Database'

const devConnection = {
  host: Env.get('DB_HOST'),
  port: Env.get('DB_PORT'),
  user: Env.get('DEV_DB_USER'),
  password: Env.get('DEV_DB_PASSWORD', ''),
  database: Env.get('DEV_DB'),
}

const stageConnection = {
  host: Env.get('DB_HOST'),
  port: Env.get('DB_PORT'),
  user: Env.get('STAGE_DB_USER'),
  password: Env.get('STAGE_DB_PASSWORD', ''),
  database: Env.get('STAGE_DB'),
}

const prodConnection = {
  host: Env.get('DB_HOST'),
  port: Env.get('DB_PORT'),
  user: Env.get('PROD_DB_USER'),
  password: Env.get('PROD_DB_PASSWORD', ''),
  database: Env.get('PROD_DB'),
}

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
      connection:
        (Env.get('NODE_ENV') === 'development' && devConnection) ||
        (Env.get('NODE_ENV') === 'staging' && stageConnection) ||
        (Env.get('NODE_ENV') === 'production' && prodConnection),
      migrations: {
        naturalSort: true,
      },
      healthCheck: true,
      debug: false,
    },
  },
}

export default databaseConfig
