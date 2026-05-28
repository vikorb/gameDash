import path from 'node:path'
import type { Knex } from 'knex'
import * as dotenv from 'dotenv'

const envPath = path.resolve(__dirname, '../../.env')

dotenv.config({
  path: envPath,
})

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL is missing. Tried to load env from: ${envPath}`)
}

const config: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.resolve(__dirname, 'migrations'),
      extension: 'ts',
    },
    seeds: {
      directory: path.resolve(__dirname, 'seeds'),
      extension: 'ts',
    },
  },
}

export default config