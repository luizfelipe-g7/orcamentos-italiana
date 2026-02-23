import api from './api';
import type { BudgetSummary } from '../types/budgetSummaryType';

export const budgetService = {
  async getAll(): Promise<BudgetSummary[]> {
    const response = await api.get('/orcamentos');
    // Backend retorna { success, data, pagination }, mas mantemos fallback para array direto.
    const rawList = Array.isArray(response.data) ? response.data : response.data?.data;
    const list = Array.isArray(rawList) ? rawList : [];

    return list.map((item: any) => ({
      id: item.id,
      service: item.nome_familia || 'Família Sem Nome',
      value: item.valor_total ? `R$ ${parseFloat(item.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
      createdAt: new Date(item.created_at).toLocaleDateString('pt-BR'),
      updatedAt: new Date(item.updated_at).toLocaleDateString('pt-BR'),
      citizenship: item.cidadania || 'IT',
      status: item.status || 'Pendente',
      clientName: item.responsavel_nome
    }));
  },

  async getById(id: string) {
    const response = await api.get(`/orcamentos/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/orcamentos', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/orcamentos/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/orcamentos/${id}`);
  }
};
