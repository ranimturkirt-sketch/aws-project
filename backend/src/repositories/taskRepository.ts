// =============================================================================
// Task Repository — backend/src/repositories/taskRepository.ts
// =============================================================================
// Data access layer for the tasks table.
// All SQL queries are isolated here for easy testing and maintenance.
// =============================================================================

import { Pool } from 'pg';

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

export class TaskRepository {
  constructor(private pool: Pool) {}

  /**
   * Retrieve all tasks, ordered by creation date (newest first).
   */
  async findAll(): Promise<Task[]> {
    const result = await this.pool.query<Task>(
      'SELECT id, title, description, completed, created_at, updated_at FROM tasks ORDER BY created_at DESC'
    );
    return result.rows;
  }

  /**
   * Find a single task by its ID.
   * Returns null if the task does not exist.
   */
  async findById(id: number): Promise<Task | null> {
    const result = await this.pool.query<Task>(
      'SELECT id, title, description, completed, created_at, updated_at FROM tasks WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new task and return it.
   */
  async create(input: CreateTaskInput): Promise<Task> {
    const result = await this.pool.query<Task>(
      `INSERT INTO tasks (title, description)
       VALUES ($1, $2)
       RETURNING id, title, description, completed, created_at, updated_at`,
      [input.title, input.description || '']
    );
    return result.rows[0];
  }

  /**
   * Update an existing task.
   * Only updates fields that are provided in the input.
   * Returns the updated task, or null if the task does not exist.
   */
  async update(id: number, input: UpdateTaskInput): Promise<Task | null> {
    // Build dynamic SET clause based on provided fields
    const setClauses: string[] = [];
    const values: (string | boolean)[] = [];
    let paramIndex = 1;

    if (input.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(input.title);
    }

    if (input.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }

    if (input.completed !== undefined) {
      setClauses.push(`completed = $${paramIndex++}`);
      values.push(input.completed);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id as unknown as string);

    const result = await this.pool.query<Task>(
      `UPDATE tasks SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, title, description, completed, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a task by its ID.
   * Returns true if the task was deleted, false if it did not exist.
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
