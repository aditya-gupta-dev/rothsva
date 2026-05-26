# backend

To install dependencies:

```bash
bun install
```

Required environment variables:

```env
FRONTEND_URL=http://localhost:5173
DATABASE_URL=libsql://...
DATABASE_TOKEN=...
JWT_SECRET=replace-this-with-a-long-random-secret
```

To run:

```bash
bun run index.ts
```

Notes:

- The backend exits immediately if `FRONTEND_URL`, `DATABASE_URL`, `DATABASE_TOKEN`, or `JWT_SECRET` is missing.
- CORS allows all headers and common HTTP methods, but only for the exact `FRONTEND_URL` origin.
- The server binds to `0.0.0.0`.
- `PORT` is optional and defaults to `3000`.

This project was created using `bun init` in bun v1.3.13. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
