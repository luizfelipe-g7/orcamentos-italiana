import knex from 'knex';
import { env } from './env';

export const db = knex({
  client: 'pg',
  connection: {
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: env.NODE_ENV === 'production' ? 20 : 10,
  },
});

// Teste de conexão
export async function testConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}
