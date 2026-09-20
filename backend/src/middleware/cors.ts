// =============================================================================
// CORS Middleware — backend/src/middleware/cors.ts
// =============================================================================
// Configures Cross-Origin Resource Sharing for the Express application.
// In production, the origin should be restricted to the CloudFront domain.
// =============================================================================

import cors from 'cors';
import { RequestHandler } from 'express';

/**
 * Create CORS middleware with the specified allowed origin.
 * @param origin - The allowed origin (e.g., CloudFront URL). Use '*' for development.
 */
export function createCorsMiddleware(origin: string): RequestHandler {
  return cors({
    origin: origin === '*' ? true : origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
  });
}
