import { db } from '../config/database';
import { Documento } from '../types';

export const documentoRepository = {
  async findByMembro(membroId: number): Promise<Documento[]> {
    return db('documentos')
      .where({ membro_id: membroId })
      .orderBy('created_at', 'desc');
  },

  async findById(id: number): Promise<Documento | undefined> {
    return db('documentos').where({ id }).first();
  },

  async create(data: Partial<Documento>): Promise<Documento> {
    const [created] = await db('documentos')
      .insert(data)
      .returning('*');
    return created;
  },

  async updateStatus(id: number, status: string, observacoes?: string): Promise<Documento | undefined> {
    const updateData: any = { status, updated_at: new Date() };
    if (observacoes) updateData.observacoes = observacoes;

    const [updated] = await db('documentos')
      .where({ id })
      .update(updateData)
      .returning('*');
    return updated;
  },

  async delete(id: number): Promise<boolean> {
    const deleted = await db('documentos').where({ id }).del();
    return deleted > 0;
  },
};
