import { orcamentoService } from '../../src/services/orcamentoService';
import { orcamentoRepository } from '../../src/repositories/orcamentoRepository';
// import { ForbiddenError, NotFoundError } from '../../src/utils/errors';

// Mock do repository
jest.mock('../../src/repositories/orcamentoRepository');

describe('Orcamento Service Unit Tests', () => {
  const mockOrcamento = {
    id: 1,
    nome_familia: 'Família Teste',
    cidadania: 'IT',
    status: 'ABERTO',
    operador_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarPorId', () => {
    it('deve retornar orçamento se usuário for dono', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);

      const result = await orcamentoService.buscarPorId(1, 1, 'VENDEDOR');
      expect(result).toEqual(mockOrcamento);
    });

    it('deve retornar orçamento se usuário for ADM', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);

      const result = await orcamentoService.buscarPorId(1, 999, 'ADM');
      expect(result).toEqual(mockOrcamento);
    });

    it('deve lançar ForbiddenError se usuário não for dono nem ADM', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);

      await expect(orcamentoService.buscarPorId(1, 999, 'VENDEDOR'))
        .rejects.toThrow('Você não tem permissão para acessar este orçamento');
    });

    it('deve lançar NotFoundError se orçamento não existir', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(orcamentoService.buscarPorId(1, 1, 'VENDEDOR'))
        .rejects.toThrow('Orçamento não encontrado');
    });
  });

  describe('atualizar', () => {
    it('deve permitir atualização se status for ABERTO', async () => {
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(mockOrcamento);
      (orcamentoRepository.update as jest.Mock).mockResolvedValue({ ...mockOrcamento, nome_familia: 'Novo Nome' });

      const result = await orcamentoService.atualizar(1, { nome_familia: 'Novo Nome' }, 1, 'VENDEDOR');
      expect(result?.nome_familia).toBe('Novo Nome');
    });

    it('deve bloquear atualização se status não for ABERTO e usuário for VENDEDOR', async () => {
      const orcamentoFechado = { ...mockOrcamento, status: 'FECHADO' };
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(orcamentoFechado);

      await expect(orcamentoService.atualizar(1, { nome_familia: 'Novo Nome' }, 1, 'VENDEDOR'))
        .rejects.toThrow('Apenas orçamentos em aberto podem ser editados por vendedores');
    });

    it('deve permitir atualização de qualquer status se usuário for ADM', async () => {
      const orcamentoFechado = { ...mockOrcamento, status: 'FECHADO' };
      (orcamentoRepository.findById as jest.Mock).mockResolvedValue(orcamentoFechado);
      (orcamentoRepository.update as jest.Mock).mockResolvedValue({ ...orcamentoFechado, nome_familia: 'Novo Nome' });

      const result = await orcamentoService.atualizar(1, { nome_familia: 'Novo Nome' }, 999, 'ADM');
      expect(result?.nome_familia).toBe('Novo Nome');
    });
  });
});
