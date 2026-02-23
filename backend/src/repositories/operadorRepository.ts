import { db } from '../config/database';
import { Operador } from '../types';

let operadoresColumnsCache: Set<string> | null = null;
let fotoColumnEnsured = false;

async function ensureFotoUrlColumn(): Promise<void> {
  if (fotoColumnEnsured) return;
  await db.raw("ALTER TABLE operadores ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500)");
  fotoColumnEnsured = true;
  operadoresColumnsCache = null;
}

async function getOperadoresColumns(): Promise<Set<string>> {
  if (operadoresColumnsCache) return operadoresColumnsCache;

  const result = await db.raw(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'operadores'"
  );

  const rows = Array.isArray(result?.rows)
    ? result.rows
    : Array.isArray(result?.[0]?.rows)
      ? result[0].rows
      : Array.isArray(result?.[0])
        ? result[0]
        : [];

  operadoresColumnsCache = new Set(rows.map((r: any) => String(r.column_name)));
  return operadoresColumnsCache;
}

async function filterByExistingColumns<T extends Record<string, any>>(data: T): Promise<Partial<T>> {
  const columns = await getOperadoresColumns();
  const filtered: Partial<T> = {};

  for (const [key, value] of Object.entries(data)) {
    if (columns.has(key)) {
      (filtered as any)[key] = value;
    }
  }

  return filtered;
}

export const operadorRepository = {
  async findAllVendedores(): Promise<Operador[]> {
    return db('operadores')
      .where({ role: 'VENDEDOR' })
      .orderBy('created_at', 'desc');
  },

  async findByEmail(email: string): Promise<Operador | undefined> {
    return db('operadores').where({ email }).first();
  },

  async findById(id: number): Promise<Operador | undefined> {
    return db('operadores').where({ id }).first();
  },

  async create(data: Partial<Operador>): Promise<Operador> {
    await ensureFotoUrlColumn();
    const payload = await filterByExistingColumns(data as Record<string, any>);
    const [created] = await db('operadores').insert(payload).returning('*');
    return created;
  },

  async update(id: number, data: Partial<Operador>): Promise<Operador | undefined> {
    await ensureFotoUrlColumn();
    const payload = await filterByExistingColumns({
      ...data,
      updated_at: new Date(),
    });

    const [updated] = await db('operadores')
      .where({ id })
      .update(payload)
      .returning('*');
    return updated;
  },
};
