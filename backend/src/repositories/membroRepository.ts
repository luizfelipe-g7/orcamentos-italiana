import { db } from '../config/database';
import { Membro } from '../types';
import { CreateMembroInput, UpdateMembroInput } from '../schemas/membroSchema';

export const membroRepository = {
  async findByOrcamento(orcamentoId: number): Promise<Membro[]> {
    return db('membros')
      .where({ orcamento_id: orcamentoId })
      .orderBy('created_at', 'asc');
  },

  async findById(id: number): Promise<Membro | undefined> {
    return db('membros').where({ id }).first();
  },

  async create(data: CreateMembroInput): Promise<Membro> {
    const [created] = await db('membros')
      .insert(data)
      .returning('*');
    return created;
  },

  async update(id: number, data: UpdateMembroInput): Promise<Membro | undefined> {
    const [updated] = await db('membros')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(),
      })
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
