import nextEnv from '@next/env';
import pg from 'pg';

nextEnv.loadEnvConfig(process.cwd());
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is missing from .env');
const client = new pg.Client({ connectionString, connectionTimeoutMillis: 10000, query_timeout: 10000 });
try {
  await client.connect();
  const result = await client.query('SELECT 1 AS connected');
  const tables = await client.query("SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public'");
  console.log(JSON.stringify({ connected: result.rows[0].connected === 1, publicTables: tables.rows[0].count }));
  if (process.argv.includes('--schema')) {
    const schema = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log(JSON.stringify({ tables: schema.rows.map(row => row.table_name) }));
  }
} catch (error) {
  console.error('Database check failed:', error.code ?? error.name, error.message.replace(/postgres(?:ql)?:\/\/\S+/g, '[redacted]'));
  process.exitCode = 1;
} finally {
  await client.end();
}
