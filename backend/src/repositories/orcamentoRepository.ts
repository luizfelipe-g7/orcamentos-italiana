import { db } from '../config/database';
import { Orcamento } from '../types';
import { CreateOrcamentoInput, UpdateOrcamentoInput } from '../schemas/orcamentoSchema';

export const orcamentoRepository = {
  async findAll(page: number = 1, limit: number = 10, filters?: Partial<Orcamento>) {
    const offset = (page - 1) * limit;
    
    let query = db('orcamentos').select('*');

    if (filters) {
      if (filters.status) query = query.where('status', filters.status);
      if (filters.cidadania) query = query.where('cidadania', filters.cidadania);
      if (filters.operador_id) query = query.where('operador_id', filters.operador_id);
    }

    const [count] = await query.clone().clearSelect().count('id as total');
    const data = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);

    return {
      data,
      total: Number(count.total),
    };
  },

  async findById(id: number): Promise<Orcamento | undefined> {
    return db('orcamentos').where({ id }).first();
  },

  async create(data: CreateOrcamentoInput, operadorId: number): Promise<Orcamento> {
    const [created] = await db('orcamentos')
      .insert({
        ...data,
        operador_id: operadorId,
        status: 'ABERTO',
      })
      .returning('*');

    return created;
  },

  async update(id: number, data: UpdateOrcamentoInput): Promise<Orcamento | undefined> {
    const [updated] = await db('orcamentos')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');

    return updated;
  },

  async delete(id: number): Promise<boolean> {
    const deleted = await db('orcamentos').where({ id }).del();
    return deleted > 0;
  },
};
