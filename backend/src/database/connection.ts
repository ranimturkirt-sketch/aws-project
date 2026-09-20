// =============================================================================
// Database Connection — backend/src/database/connection.ts
// =============================================================================
// Creates and manages a PostgreSQL connection pool using the `pg` library.
// The pool is configured from the application config (env vars or Secrets Manager).
// =============================================================================

import { Pool, PoolConfig } from 'pg';
import { AppConfig } from '../config';

let pool: Pool | null = null;

/**
 * Create and return a PostgreSQL connection pool.
 * Uses singleton pattern to reuse the pool across the application.
 */
export function createPool(config: AppConfig): Pool {
  if (pool) {
    return pool;
  }

  const poolConfig: PoolConfig = {
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    user: config.db.username,
    password: config.db.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  // Enable SSL for production (required for RDS)
  if (config.db.ssl) {
    poolConfig.ssl = {
      rejectUnauthorized: false,
    };
  }

  pool = new Pool(poolConfig);

  pool.on('error', (err: Error) => {
    console.error('Unexpected PostgreSQL pool error:', err);
  });

  pool.on('connect', () => {
    console.log('New PostgreSQL client connected');
  });

  return pool;
}

/**
 * Get the existing pool instance.
 * Throws if the pool has not been created yet.
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call createPool() first.');
  }
  return pool;
}

/**
 * Close the pool and release all connections.
 * Used during graceful shutdown.
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('PostgreSQL pool closed');
  }
}
