/**
 * ============================================================================
 * DATABASE CONNECTION (node-postgres pool shared with Better Auth)
 * ============================================================================
 *
 * A single pooled connection is reused across the app and by Better Auth. The
 * pool is created lazily and never throws at import time, so pages that do not
 * touch the database keep rendering even when DATABASE_URL is unset.
 * ============================================================================
 */

import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'
import { env, isDatabaseConfigured } from '@/lib/env'

declare global {
  // eslint-disable-next-line no-var
  var __saiAmanPool: Pool | undefined
}

function createPool(): Pool | null {
  if (!isDatabaseConfigured()) return null
  const needsSsl = /sslmode=require|neon\.tech|supabase\.co|render\.com/.test(env.DATABASE_URL)
  return new Pool({
    connectionString: env.DATABASE_URL,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 10,
  })
}

/** Shared pg pool (reused across HMR reloads). Null when DB is not configured. */
export const pool: Pool | null = global.__saiAmanPool ?? createPool()
if (process.env.NODE_ENV !== 'production' && pool) global.__saiAmanPool = pool

/**
 * Drizzle client. Throws a clear error only when actually used without a DB,
 * never at import time.
 */
export const db = pool
  ? drizzle(pool, { schema })
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(
            'Database is not configured. Set the DATABASE_URL environment variable to enable bookings, accounts and the admin dashboard.',
          )
        },
      },
    ) as ReturnType<typeof drizzle>)

export { schema }
