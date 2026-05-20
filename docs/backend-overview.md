# Backend Overview (AI-Ready)

This document provides a concise overview of the backend service located in `apps/backend/`.

## Tech Stack
- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Hono](https://hono.dev)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Database**: [Turso](https://turso.tech) (LibSQL)
- **Authentication**: JWT (JSON Web Tokens) with 1-month expiration.

## Database Schema
The primary table is `users`:
- `id`: UUID (Primary Key)
- `name`: Text
- `email`: Text (Unique)
- `password`: Hashed text (using `Bun.password`)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## API Endpoints

### Authentication
- **`POST /auth/register`**
  - Payload: `{ "name": "...", "email": "...", "password": "..." }`
  - Returns: `{ "user": { "id", "name", "email" } }`
- **`POST /auth/login`**
  - Payload: `{ "email": "...", "password": "..." }`
  - Returns: `{ "token": "...", "user": { "id", "name", "email" } }`
  - Note: Token is valid for 30 days.

### Protected Routes
Requires `Authorization: Bearer <token>` header.
- **`GET /me`**
  - Returns: Current authenticated user profile.

## Development Commands
From `apps/backend/`:
- `bun start`: Starts the server on port 3000.
- `bun run db:push`: Syncs local schema with Turso database.
- `bun run db:studio`: Opens Drizzle Studio to browse data.

## Configuration
Requires a `.env` file in the root directory with:
- `DATABASE_URL`: Turso connection string.
- `DATABASE_TOKEN`: Turso auth token.
- `JWT_SECRET`: Secret key for signing tokens.
