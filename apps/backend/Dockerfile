# Stage 1: Build and install dependencies
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy workspace root files for dependency resolution
COPY package.json bun.lock ./

# Copy backend app and utils package
COPY packages/ packages/
COPY apps/backend/ apps/backend/

# Install only production dependencies
ENV NODE_ENV=production
RUN rm -f bun.lock && bun install --production

# Stage 2: Final lightweight image
FROM oven/bun:1-alpine AS release

WORKDIR /app
ENV NODE_ENV=production

# Copy built app and node_modules from the builder stage
COPY --from=builder /app /app

# Set the working directory to the backend application
WORKDIR /app/apps/backend

# Expose the port the app runs on
EXPOSE 3000

# Start the application using Bun natively
CMD ["bun", "run", "index.ts"]
