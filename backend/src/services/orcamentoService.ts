import { orcamentoRepository } from '../repositories/orcamentoRepository';
import { CreateOrcamentoInput, UpdateOrcamentoInput } from '../schemas/orcamentoSchema';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { UserRole } from '../types';

export const orcamentoService = {
  async listar(page: number, limit: number, userId: number, role: UserRole, filters: any = {}) {
    // Se não for ADM, só vê seus próprios orçamentos
    if (role !== 'ADM') {
      filters.operador_id = userId;
    }

    return orcamentoRepository.findAll(page, limit, filters);
  },

  async buscarPorId(id: number, userId: number, role: UserRole) {
    const orcamento = await orcamentoRepository.findById(id);

    if (!orcamento) {
      throw new NotFoundError('Orçamento não encontrado');
    }

    // Validação de acesso
    if (role !== 'ADM' && orcamento.operador_id !== userId) {
      throw new ForbiddenError('Você não tem permissão para acessar este orçamento');
    }

    return orcamento;
  },

  async criar(data: CreateOrcamentoInput, operadorId: number) {
    return orcamentoRepository.create(data, operadorId);
  },

  async atualizar(id: number, data: UpdateOrcamentoInput, userId: number, role: UserRole) {
    const orcamento = await this.buscarPorId(id, userId, role);

    // Se for VENDEDOR, só pode editar se estiver ABERTO
    if (role !== 'ADM' && orcamento.status !== 'ABERTO') {
      throw new ForbiddenError('Apenas orçamentos em aberto podem ser editados por vendedores');
    }

    return orcamentoRepository.update(id, data);
  },

  async excluir(id: number, userId: number, role: UserRole) {
    const orcamento = await this.buscarPorId(id, userId, role);

    // Apenas ADM ou dono do orçamento (se aberto) pode excluir
    if (role !== 'ADM' && orcamento.status !== 'ABERTO') {
      throw new ForbiddenError('Não é possível excluir orçamentos que não estão em aberto');
    }

    return orcamentoRepository.delete(id);
  },
};
