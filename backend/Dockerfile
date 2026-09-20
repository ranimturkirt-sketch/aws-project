# =============================================================================
# Backend — Dockerfile
# =============================================================================
# Multi-stage build for the Task Manager backend.
#
# Stage 1 (builder): Install dependencies and compile TypeScript.
# Stage 2 (runtime): Minimal production image with compiled JavaScript.
#
# Security:
#   - Runs as non-root user (node)
#   - NODE_ENV=production
#   - HEALTHCHECK included
#   - Minimal attack surface (no dev dependencies in final image)
# =============================================================================

# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for tsc)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# ── Stage 2: Production Runtime ────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Add labels for image metadata
LABEL maintainer="ranimturkirt"
LABEL description="Task Manager Backend — DevSecOps AWS Project"
LABEL version="1.0.0"

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Create a non-root user (node user exists in alpine image)
# Ensure the app directory is owned by node
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose the application port
EXPOSE 3000

# Health check — verifies the app is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
