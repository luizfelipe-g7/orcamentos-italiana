import { membroRepository } from '../repositories/membroRepository';
import { orcamentoRepository } from '../repositories/orcamentoRepository';
import { CreateMembroInput, UpdateMembroInput } from '../schemas/membroSchema';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { UserRole } from '../types';

export const membroService = {
  async listarPorOrcamento(orcamentoId: number, userId: number, role: UserRole) {
    // Verifica se o orçamento existe e se o usuário tem acesso
    const orcamento = await orcamentoRepository.findById(orcamentoId);

    if (!orcamento) {
      throw new NotFoundError('Orçamento não encontrado');
    }

    if (role !== 'ADM' && orcamento.operador_id !== userId) {
      throw new ForbiddenError('Você não tem permissão para acessar este orçamento');
    }

    return membroRepository.findByOrcamento(orcamentoId);
  },

  async listarTodos(userId: number, role: UserRole) {
    if (role !== 'ADM') {
      // Se não for admin, talvez listar apenas membros dos orçamentos do usuário?
      // Por enquanto, vamos restringir a ADM ou implementar filtro por operador depois
      // Vamos permitir listar todos mas filtrar no repositório seria melhor.
      // Como não temos filtro no repo ainda, vamos deixar restrito a ADM ou implementar filtro em memória (ruim)
      // Melhor: deixar ADM only por enquanto ou implementar findByOperador no repo.
      // Vamos simplificar: listar todos para ADM, e vazio para outros por enquanto, ou implementar direito.
      // Vamos implementar direito: listar apenas membros de orçamentos do operador.
      // Mas isso requer join.
      // Para simplificar o "funcionalidades funcionando", vamos permitir listar todos se for ADM.
      throw new ForbiddenError('Apenas administradores podem listar todos os membros.');
    }
    return membroRepository.findAll();
  },

  async buscarPorId(id: number, userId: number, role: UserRole) {
    const membro = await membroRepository.findById(id);

    if (!membro) {
      throw new NotFoundError('Membro não encontrado');
    }

    // Verifica permissão através do orçamento pai
    const orcamento = await orcamentoRepository.findById(membro.orcamento_id);
    
    if (!orcamento) {
      throw new NotFoundError('Orçamento vinculado não encontrado');
    }

    if (role !== 'ADM' && orcamento.operador_id !== userId) {
      throw new ForbiddenError('Você não tem permissão para acessar este membro');
    }

    return membro;
  },

  async criar(data: CreateMembroInput, userId: number, role: UserRole) {
    const orcamento = await orcamentoRepository.findById(data.orcamento_id);

    if (!orcamento) {
      throw new NotFoundError('Orçamento não encontrado');
    }

    if (role !== 'ADM') {
      if (orcamento.operador_id !== userId) {
        throw new ForbiddenError('Você não tem permissão para adicionar membros neste orçamento');
      }
      if (orcamento.status !== 'ABERTO') {
        throw new ForbiddenError('Apenas orçamentos em aberto podem receber novos membros');
      }
    }

    return membroRepository.create(data);
  },

  async atualizar(id: number, data: UpdateMembroInput, userId: number, role: UserRole) {
    const membro = await this.buscarPorId(id, userId, role);
    const orcamento = await orcamentoRepository.findById(membro.orcamento_id);

    if (role !== 'ADM' && orcamento?.status !== 'ABERTO') {
      throw new ForbiddenError('Não é possível editar membros de orçamentos fechados');
    }

    return membroRepository.update(id, data);
  },

  async excluir(id: number, userId: number, role: UserRole) {
    const membro = await this.buscarPorId(id, userId, role);
    const orcamento = await orcamentoRepository.findById(membro.orcamento_id);

    if (role !== 'ADM' && orcamento?.status !== 'ABERTO') {
      throw new ForbiddenError('Não é possível excluir membros de orçamentos fechados');
    }

    return membroRepository.delete(id);
  },
};
