import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { db } from '../db'
import * as schema from '../db/schema'

const productionUrl = process.env.BETTER_AUTH_URL || ''

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  trustedOrigins: [productionUrl, 'http://localhost:5173', 'http://localhost:3000'],
})
