// =============================================================================
// Server — backend/src/server.ts
// =============================================================================
// Main entry point for the Task Manager backend.
// Sets up Express, middleware, routes, database, and graceful shutdown.
// =============================================================================

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { loadConfig } from './config';
import { createPool, closePool } from './database/connection';
import { runMigrations } from './database/migrations';
import { TaskRepository } from './repositories/taskRepository';
import { TaskService } from './services/taskService';
import { TaskController } from './controllers/taskController';
import { createTaskRouter } from './routes/taskRoutes';
import { errorHandler } from './middleware/errorHandler';
import { createCorsMiddleware } from './middleware/cors';
import { createLogger } from './middleware/logger';

async function main(): Promise<void> {
  const logger = createLogger();
  logger.info('Starting Task Manager backend...');

  // ── Load Configuration ──────────────────────────────────────────────
  const config = await loadConfig();
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Port: ${config.port}`);

  // ── Create Express App ──────────────────────────────────────────────
  const app = express();

  // ── Security Middleware ─────────────────────────────────────────────
  app.use(helmet());
  app.use(createCorsMiddleware(config.cors.origin));

  // ── Request Parsing ─────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── Request Logging ─────────────────────────────────────────────────
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

  // ── Health Check ────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    });
  });

  // ── Database Setup ──────────────────────────────────────────────────
  const pool = createPool(config);

  // Test database connection
  try {
    const client = await pool.connect();
    logger.info('Database connection established');
    client.release();
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
    logger.warn('Continuing without database connection (development mode)');
  }

  // Run migrations
  try {
    await runMigrations(pool);
  } catch (error) {
    logger.error('Migration failed:', error);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }

  // ── Application Layers ──────────────────────────────────────────────
  const taskRepository = new TaskRepository(pool);
  const taskService = new TaskService(taskRepository);
  const taskController = new TaskController(taskService);

  // ── Routes ──────────────────────────────────────────────────────────
  app.use('/api/tasks', createTaskRouter(taskController));

  // ── API Info Route ──────────────────────────────────────────────────
  app.get('/api', (_req, res) => {
    res.json({
      name: 'Task Manager API',
      version: '1.0.0',
      endpoints: {
        health: 'GET /health',
        tasks: {
          list: 'GET /api/tasks',
          get: 'GET /api/tasks/:id',
          create: 'POST /api/tasks',
          update: 'PUT /api/tasks/:id',
          delete: 'DELETE /api/tasks/:id',
        },
      },
    });
  });

  // ── 404 Handler ─────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  // ── Error Handler ───────────────────────────────────────────────────
  app.use(errorHandler);

  // ── Start Server ────────────────────────────────────────────────────
  const server = app.listen(config.port, () => {
    logger.info(`Task Manager API running on port ${config.port}`);
    logger.info(`Health check: http://localhost:${config.port}/health`);
    logger.info(`API docs: http://localhost:${config.port}/api`);
  });

  // ── Graceful Shutdown ───────────────────────────────────────────────
  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed');
      await closePool();
      logger.info('Database pool closed');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
