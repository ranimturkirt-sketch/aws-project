// =============================================================================
// Logger Middleware — backend/src/middleware/logger.ts
// =============================================================================
// Configures structured logging using Winston.
// Provides both console and structured JSON logging for CloudWatch.
// =============================================================================

import winston from 'winston';

/**
 * Create a Winston logger configured for the current environment.
 * - Development: colorized console output
 * - Production: JSON format for CloudWatch Logs
 */
export function createLogger(): winston.Logger {
  const isProduction = process.env.NODE_ENV === 'production';

  const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      isProduction
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          )
    ),
    defaultMeta: { service: 'taskmanager-backend' },
    transports: [new winston.transports.Console()],
  });

  return logger;
}
