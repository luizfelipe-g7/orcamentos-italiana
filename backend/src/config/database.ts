import knex from 'knex';
import { env } from './env';

export const db = knex({
  client: 'pg',
  connection: {
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: { rejectUnauthorized: false }, // Supabase requer SSL
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
