// =============================================================================
// Error Handler Middleware — backend/src/middleware/errorHandler.ts
// =============================================================================
// Global error handling middleware for Express.
// Catches all errors and returns consistent JSON error responses.
// =============================================================================

import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  code?: string;
  statusCode?: number;
}

/**
 * Global error handler middleware.
 * Must have 4 parameters for Express to recognize it as error middleware.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Determine HTTP status code based on error code
  let statusCode = err.statusCode || 500;

  switch (err.code) {
    case 'NOT_FOUND':
      statusCode = 404;
      break;
    case 'VALIDATION_ERROR':
      statusCode = 400;
      break;
    case '23505': // PostgreSQL unique violation
      statusCode = 409;
      break;
    default:
      if (statusCode === 500) {
        console.error('Internal Server Error:', err);
      }
  }

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
