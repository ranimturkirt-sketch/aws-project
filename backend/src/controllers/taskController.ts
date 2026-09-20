// =============================================================================
// Task Controller — backend/src/controllers/taskController.ts
// =============================================================================
// Handles HTTP request/response logic for the Task API.
// Delegates business logic to the TaskService.
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';

export class TaskController {
  constructor(private service: TaskService) {}

  /**
   * GET /api/tasks
   * Retrieve all tasks.
   */
  getAllTasks = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.service.getAllTasks();
      res.json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/tasks/:id
   * Retrieve a single task by ID.
   */
  getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid task ID',
        });
        return;
      }

      const task = await this.service.getTaskById(id);
      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/tasks
   * Create a new task.
   */
  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description } = req.body;
      const task = await this.service.createTask({ title, description });
      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/tasks/:id
   * Update an existing task.
   */
  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid task ID',
        });
        return;
      }

      const { title, description, completed } = req.body;
      const task = await this.service.updateTask(id, { title, description, completed });
      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/tasks/:id
   * Delete a task.
   */
  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid task ID',
        });
        return;
      }

      await this.service.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
