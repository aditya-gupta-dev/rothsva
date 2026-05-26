import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schemas';
import { requireEnvironmentVariables } from '../env';

const env = requireEnvironmentVariables();

const client = createClient({
  url: env.database_url,
  authToken: env.database_token,
});

export const db = drizzle(client, { schema });
