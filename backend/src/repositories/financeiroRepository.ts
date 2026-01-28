import { db } from '../config/database';
import { CreateHonorarioInput, CreatePaganteInput, CreateParcelaInput } from '../schemas/financeiroSchema';

export const financeiroRepository = {
  // --- Honorários ---
  async listHonorarios(orcamentoId: number) {
    return db('honorarios').where({ orcamento_id: orcamentoId });
  },

  async createHonorario(data: CreateHonorarioInput) {
    const valor_final = (data.valor * data.quantidade) - (data.desconto || 0);
    const [created] = await db('honorarios')
      .insert({ ...data, valor_final })
      .returning('*');
    return created;
  },

  async deleteHonorario(id: number) {
    return db('honorarios').where({ id }).del();
  },

  // --- Pagantes ---
  async listPagantes(orcamentoId: number) {
    const pagantes = await db('pagantes').where({ orcamento_id: orcamentoId });
    
    // Busca parcelas para cada pagante
    for (const pagante of pagantes) {
      pagante.parcelas = await db('parcelas')
        .where({ pagante_id: pagante.id })
        .orderBy('numero_parcela', 'asc');
    }
    
    return pagantes;
  },

  async createPagante(data: CreatePaganteInput) {
    return db.transaction(async (trx) => {
      const { parcelas, ...paganteData } = data;
      
      const [pagante] = await trx('pagantes')
        .insert(paganteData)
        .returning('*');

      if (parcelas && parcelas.length > 0) {
        const parcelasComId = parcelas.map(p => ({
          ...p,
          pagante_id: pagante.id
        }));
        
        await trx('parcelas').insert(parcelasComId);
      }

      return pagante;
    });
  },

  async deletePagante(id: number) {
    return db('pagantes').where({ id }).del();
  },

  // --- Parcelas ---
  async updateParcela(id: number, data: Partial<CreateParcelaInput>) {
    const [updated] = await db('parcelas')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return updated;
  },
  
  async findPaganteById(id: number) {
    return db('pagantes').where({ id }).first();
  },

  async findHonorarioById(id: number) {
    return db('honorarios').where({ id }).first();
  },

  async findParcelaById(id: number) {
    return db('parcelas').where({ id }).first();
  }
};
