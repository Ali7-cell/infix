import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

if (!databaseUrl && typeof window === 'undefined') {
  console.warn('[Neon Database] Warning: DATABASE_URL is not configured.');
}

/**
 * Serverless SQL client for Neon Database
 * Use inside Server Components, Server Actions, or Route Handlers (API routes)
 */
export const sql = neon(databaseUrl);

export default sql;
