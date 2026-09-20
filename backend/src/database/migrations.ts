// =============================================================================
// Database Migrations — backend/src/database/migrations.ts
// =============================================================================
// Runs database migrations on startup to ensure the tasks table exists.
// In production, you would use a dedicated migration tool (e.g., Flyway, Knex).
// This approach is simplified for the pedagogical purpose of this project.
// =============================================================================

import { Pool } from 'pg';

/**
 * Run database migrations.
 * Creates the tasks table if it does not exist.
 */
export async function runMigrations(pool: Pool): Promise<void> {
  console.log('Running database migrations...');

  const createTasksTable = `
    CREATE TABLE IF NOT EXISTS tasks (
      id            SERIAL PRIMARY KEY,
      title         VARCHAR(255) NOT NULL,
      description   TEXT DEFAULT '',
      completed     BOOLEAN DEFAULT FALSE,
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const createUpdatedAtTrigger = `
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `;

  const createTrigger = `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_updated_at'
      ) THEN
        CREATE TRIGGER update_tasks_updated_at
          BEFORE UPDATE ON tasks
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END;
    $$;
  `;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(createTasksTable);
    await client.query(createUpdatedAtTrigger);
    await client.query(createTrigger);
    await client.query('COMMIT');
    console.log('Database migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
