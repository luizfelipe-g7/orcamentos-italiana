import { financeiroRepository } from '../repositories/financeiroRepository';
import { orcamentoRepository } from '../repositories/orcamentoRepository';
import { CreateHonorarioInput, CreatePaganteInput, CreateParcelaInput } from '../schemas/financeiroSchema';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { UserRole } from '../types';

export const financeiroService = {
  // Validação de acesso ao orçamento
  async validarAcessoOrcamento(orcamentoId: number, userId: number, role: UserRole) {
    const orcamento = await orcamentoRepository.findById(orcamentoId);
    if (!orcamento) throw new NotFoundError('Orçamento não encontrado');
    
    if (role !== 'ADM' && orcamento.operador_id !== userId) {
      throw new ForbiddenError('Sem permissão');
    }
    
    return orcamento;
  },

  // --- Honorários ---
  async listarHonorarios(orcamentoId: number, userId: number, role: UserRole) {
    await this.validarAcessoOrcamento(orcamentoId, userId, role);
    return financeiroRepository.listHonorarios(orcamentoId);
  },

  async criarHonorario(data: CreateHonorarioInput, userId: number, role: UserRole) {
    const orcamento = await this.validarAcessoOrcamento(data.orcamento_id, userId, role);
    
    if (role !== 'ADM' && orcamento.status !== 'ABERTO') {
      throw new ForbiddenError('Orçamento fechado');
    }

    return financeiroRepository.createHonorario(data);
  },

  async excluirHonorario(id: number, userId: number, role: UserRole) {
    const honorario = await financeiroRepository.findHonorarioById(id);
    if (!honorario) throw new NotFoundError('Honorário não encontrado');

    const orcamento = await this.validarAcessoOrcamento(honorario.orcamento_id, userId, role);

    if (role !== 'ADM' && orcamento.status !== 'ABERTO') {
      throw new ForbiddenError('Orçamento fechado');
    }

    return financeiroRepository.deleteHonorario(id);
  },

  // --- Pagantes ---
  async listarPagantes(orcamentoId: number, userId: number, role: UserRole) {
    await this.validarAcessoOrcamento(orcamentoId, userId, role);
    return financeiroRepository.listPagantes(orcamentoId);
  },

  async criarPagante(data: CreatePaganteInput, userId: number, role: UserRole) {
    const orcamento = await this.validarAcessoOrcamento(data.orcamento_id, userId, role);

    if (role !== 'ADM' && orcamento.status !== 'ABERTO') {
      throw new ForbiddenError('Orçamento fechado');
    }

    return financeiroRepository.createPagante(data);
  },

  async excluirPagante(id: number, userId: number, role: UserRole) {
    const pagante = await financeiroRepository.findPaganteById(id);
    if (!pagante) throw new NotFoundError('Pagante não encontrado');

    const orcamento = await this.validarAcessoOrcamento(pagante.orcamento_id, userId, role);

    if (role !== 'ADM' && orcamento.status !== 'ABERTO') {
      throw new ForbiddenError('Orçamento fechado');
    }

    return financeiroRepository.deletePagante(id);
  },

  // --- Parcelas ---
  async atualizarParcela(id: number, data: Partial<CreateParcelaInput>, userId: number, role: UserRole) {
    const parcela = await financeiroRepository.findParcelaById(id);
    if (!parcela) throw new NotFoundError('Parcela não encontrada');

    const pagante = await financeiroRepository.findPaganteById(parcela.pagante_id);
    await this.validarAcessoOrcamento(pagante.orcamento_id, userId, role);

    return financeiroRepository.updateParcela(id, data);
  }
};
