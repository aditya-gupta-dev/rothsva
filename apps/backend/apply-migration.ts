import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';
import { requireEnvironmentVariables } from './src/env';

const env = requireEnvironmentVariables();

const client = createClient({
  url: env.database_url,
  authToken: env.database_token,
});

async function main() {
  const migrationPath = path.join(__dirname, 'src/database/migrations/global_schema_update.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  // Split by semicolon but ignore semicolons inside quotes or comments if possible
  // For this specific script, splitting by semicolon is safe enough
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Executing ${statements.length} migration statements...`);

  try {
    // PRAGMA foreign_keys cannot be run in a transaction in some environments
    await client.execute('PRAGMA foreign_keys = OFF');
    
    for (const stmt of statements) {
      if (stmt.startsWith('BEGIN') || stmt.startsWith('COMMIT') || stmt.startsWith('ROLLBACK')) {
        continue; // createClient.batch or individual executes handle transactions differently
      }
      await client.execute(stmt);
    }
    
    await client.execute('PRAGMA foreign_keys = ON');
    console.log('Migration completed successfully!');
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
}

main();
