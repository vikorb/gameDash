import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/mydb',
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },
};

export default config;