import { db } from '../config/database';
import { Membro } from '../types';
import { CreateMembroInput, UpdateMembroInput } from '../schemas/membroSchema';

let membrosColumnsCache: Set<string> | null = null;

async function getMembrosColumns(): Promise<Set<string>> {
  if (membrosColumnsCache) return membrosColumnsCache;

  const result = await db.raw(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'membros'"
  );

  const rows = Array.isArray(result?.rows)
    ? result.rows
    : Array.isArray(result?.[0]?.rows)
      ? result[0].rows
      : Array.isArray(result?.[0])
        ? result[0]
        : [];

  membrosColumnsCache = new Set(rows.map((r: any) => String(r.column_name)));
  return membrosColumnsCache;
}

async function filterByExistingColumns<T extends Record<string, any>>(data: T): Promise<Partial<T>> {
  const columns = await getMembrosColumns();
  const filtered: Partial<T> = {};

  for (const [key, value] of Object.entries(data)) {
    if (columns.has(key)) {
      (filtered as any)[key] = value;
    }
  }

  return filtered;
}

export const membroRepository = {
  async findByOrcamento(orcamentoId: number): Promise<Membro[]> {
    return db('membros')
      .where({ orcamento_id: orcamentoId })
      .orderBy('created_at', 'asc');
  },

  async findAll(): Promise<Membro[]> {
    return db('membros').orderBy('created_at', 'desc');
  },

  async findById(id: number): Promise<Membro | undefined> {
    return db('membros').where({ id }).first();
  },

  async create(data: CreateMembroInput): Promise<Membro> {
    const payload = await filterByExistingColumns({
      ...data,
      // Garante defaults quando as colunas existirem no banco
      requerente: data.requerente ?? false,
      pagante: (data as any).pagante ?? false,
      dante_causa: (data as any).dante_causa ?? false,
      nacionalidade: (data as any).nacionalidade ?? 'Brasileira',
    });

    const [created] = await db('membros')
      .insert(payload)
      .returning('*');
    return created;
  },

  async update(id: number, data: UpdateMembroInput): Promise<Membro | undefined> {
    const payload = await filterByExistingColumns({
      ...data,
      updated_at: new Date(),
    });

    const [updated] = await db('membros')
      .where({ id })
      .update(payload)
      .returning('*');
    return updated;
  },

  async delete(id: number): Promise<boolean> {
    const deleted = await db('membros').where({ id }).del();
    return deleted > 0;
  },

  // Busca o orçamento pai para validação de permissão
  async getOrcamentoId(membroId: number): Promise<number | undefined> {
    const result = await db('membros').select('orcamento_id').where({ id: membroId }).first();
    return result?.orcamento_id;
  },
};
