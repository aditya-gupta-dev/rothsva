# Backend Overview (AI-Ready)

This document provides a concise overview of the backend service located in `apps/backend/`.

## Tech Stack
- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Hono](https://hono.dev)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Database**: [Turso](https://turso.tech) (LibSQL)
- **Authentication**: JWT (JSON Web Tokens) with 1-month expiration.

## Database Schema

### `users`
- `id`: INTEGER (Primary Key, Autoincrement)
- `name`: TEXT
- `email`: TEXT (Unique)
- `password_hash`: TEXT (Hashed using `Bun.password`)
- `created_at`: TEXT (ISO Date)
- `updated_at`: TEXT (ISO Date)

### `categories`
- `id`: INTEGER (Primary Key)
- `name`: TEXT
- `parent_id`: INTEGER (FK -> categories.id)

### `payment_modes`
- `id`: INTEGER (Primary Key)
- `name`: TEXT (Unique)

### `transactions`
- `id`: INTEGER (Primary Key)
- `user_id`: INTEGER (FK -> users.id)
- `transaction_type`: TEXT ('credit' | 'debit')
- `payment_mode_id`: INTEGER (FK -> payment_modes.id)
- `amount`: REAL
- `currency`: TEXT (Default 'INR')
- `receiver_id`: INTEGER (FK -> merchants.id)
- `category_id`: INTEGER (FK -> categories.id)
- `description`: TEXT
- `official_txn_id`: TEXT
- `created_at`: TEXT
- `updated_at`: TEXT

## Standard Response Wrapper
Every response follows this Rust-inspired `Result` pattern:
```json
{
  "data": T | null,
  "err": string | null
}
```

## API Endpoints

### Authentication
- **`POST /auth/register`**
  - **Payload**: `{ "name": "...", "email": "...", "password": "..." }`
  - **Response `data`**: `{ "user": { "id": number, "name": string, "email": string }, "message": "Sign up completed" }`
- **`POST /auth/login`**
  - **Payload**: `{ "email": "...", "password": "..." }`
  - **Response `data`**: `{ "token": string, "user": { "id": number, "name": string, "email": string } }`
- **`GET /me`** (Auth Required)
  - **Response `data`**: `{ "user": { "id": number, "name": string, "email": string } }`

### Categories & Payment Modes (Auth Required)
- **`GET /categories/main`**
  - **Response `data`**: `Array<{ id: number, name: string, parentId: null }>`
- **`GET /categories/:parentId/sub`**
  - **Response `data`**: `Array<{ id: number, name: string, parentId: number }>`
- **`GET /payment-modes`**
  - **Response `data`**: `Array<{ id: number, name: string }>`
- **`GET /merchants`**
  - **Response `data`**: `Array<{ id: number, name: string }>` (Unique merchants used by user)

### Transactions
 (Auth Required)
- **`POST /transactions`**
  - **Payload**: 
    ```json
    {
      "transactionType": "credit" | "debit",
      "amount": number,
      "currency"?: string,
      "paymentModeId"?: number,
      "categoryId"?: number,
      "receiverId"?: number,
      "description"?: string,
      "officialTxnId"?: string
    }
    ```
  - **Response `data`**: `{ "message": "Transaction created successfully" }` (Bandwidth optimized)
- **`GET /transactions/:id`**
  - **Response `data`**: The full transaction object (all fields from schema).

## Development Commands
From root directory:
- `bun dev`: Starts backend and frontend in parallel.
- `bun db:push`: Syncs schema with Turso.
- `bun db:studio`: Opens Drizzle Studio.

## Configuration
Requires a `.env` file in the root directory with:
- `DATABASE_URL`: Turso connection string.
- `DATABASE_TOKEN`: Turso auth token.
- `JWT_SECRET`: Secret key for signing tokens.
