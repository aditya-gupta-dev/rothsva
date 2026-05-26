import { defineConfig } from 'drizzle-kit';
import { requireEnvironmentVariables } from './src/env';

const env = requireEnvironmentVariables();

export default defineConfig({
  schema: './src/database/schemas/index.ts',
  out: './src/database/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: env.database_url,
    authToken: env.database_token,
  },
});
