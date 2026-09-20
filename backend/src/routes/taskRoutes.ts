// =============================================================================
// Task Routes — backend/src/routes/taskRoutes.ts
// =============================================================================
// Defines all REST API routes for the Task resource.
// Routes are mounted on /api/tasks in the main server file.
// =============================================================================

import { Router } from 'express';
import { TaskController } from '../controllers/taskController';

/**
 * Create and return the task router with all CRUD routes.
 */
export function createTaskRouter(controller: TaskController): Router {
  const router = Router();

  // GET    /api/tasks      — List all tasks
  router.get('/', controller.getAllTasks);

  // GET    /api/tasks/:id  — Get a single task
  router.get('/:id', controller.getTaskById);

  // POST   /api/tasks      — Create a new task
  router.post('/', controller.createTask);

  // PUT    /api/tasks/:id  — Update a task
  router.put('/:id', controller.updateTask);

  // DELETE /api/tasks/:id  — Delete a task
  router.delete('/:id', controller.deleteTask);

  return router;
}
