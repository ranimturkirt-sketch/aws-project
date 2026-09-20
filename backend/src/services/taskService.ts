// =============================================================================
// Task Service — backend/src/services/taskService.ts
// =============================================================================
// Business logic layer for tasks.
// Sits between the controller and repository layers.
// =============================================================================

import { TaskRepository, Task, CreateTaskInput, UpdateTaskInput } from '../repositories/taskRepository';

export class TaskService {
  constructor(private repository: TaskRepository) {}

  /**
   * Get all tasks.
   */
  async getAllTasks(): Promise<Task[]> {
    return this.repository.findAll();
  }

  /**
   * Get a task by ID.
   * Throws an error if the task is not found.
   */
  async getTaskById(id: number): Promise<Task> {
    const task = await this.repository.findById(id);
    if (!task) {
      const error = new Error(`Task with id ${id} not found`);
      (error as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw error;
    }
    return task;
  }

  /**
   * Create a new task.
   * Validates required fields before creation.
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    if (!input.title || input.title.trim().length === 0) {
      const error = new Error('Task title is required');
      (error as NodeJS.ErrnoException).code = 'VALIDATION_ERROR';
      throw error;
    }

    if (input.title.length > 255) {
      const error = new Error('Task title must be 255 characters or less');
      (error as NodeJS.ErrnoException).code = 'VALIDATION_ERROR';
      throw error;
    }

    return this.repository.create({
      title: input.title.trim(),
      description: input.description?.trim() || '',
    });
  }

  /**
   * Update an existing task.
   * Validates input and ensures the task exists.
   */
  async updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
    // Ensure the task exists
    await this.getTaskById(id);

    if (input.title !== undefined && input.title.trim().length === 0) {
      const error = new Error('Task title cannot be empty');
      (error as NodeJS.ErrnoException).code = 'VALIDATION_ERROR';
      throw error;
    }

    if (input.title !== undefined && input.title.length > 255) {
      const error = new Error('Task title must be 255 characters or less');
      (error as NodeJS.ErrnoException).code = 'VALIDATION_ERROR';
      throw error;
    }

    const updated = await this.repository.update(id, {
      title: input.title?.trim(),
      description: input.description?.trim(),
      completed: input.completed,
    });

    if (!updated) {
      const error = new Error(`Task with id ${id} not found`);
      (error as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw error;
    }

    return updated;
  }

  /**
   * Delete a task by ID.
   * Throws an error if the task does not exist.
   */
  async deleteTask(id: number): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      const error = new Error(`Task with id ${id} not found`);
      (error as NodeJS.ErrnoException).code = 'NOT_FOUND';
      throw error;
    }
  }
}
