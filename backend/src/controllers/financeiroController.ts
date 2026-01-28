import { Request, Response } from 'express';
import { financeiroService } from '../services/financeiroService';
import { AuthenticatedRequest } from '../types';

export const financeiroController = {
  // Honorários
  async listarHonorarios(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { orcamentoId } = req.params;
    const dados = await financeiroService.listarHonorarios(Number(orcamentoId), user.id, user.role);
    res.json({ success: true, data: dados });
  },

  async criarHonorario(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const dados = await financeiroService.criarHonorario(req.body, user.id, user.role);
    res.status(201).json({ success: true, data: dados });
  },

  async excluirHonorario(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    await financeiroService.excluirHonorario(Number(id), user.id, user.role);
    res.status(204).send();
  },

  // Pagantes
  async listarPagantes(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { orcamentoId } = req.params;
    const dados = await financeiroService.listarPagantes(Number(orcamentoId), user.id, user.role);
    res.json({ success: true, data: dados });
  },

  async criarPagante(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const dados = await financeiroService.criarPagante(req.body, user.id, user.role);
    res.status(201).json({ success: true, data: dados });
  },

  async excluirPagante(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    await financeiroService.excluirPagante(Number(id), user.id, user.role);
    res.status(204).send();
  },

  // Parcelas
  async atualizarParcela(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const dados = await financeiroService.atualizarParcela(Number(id), req.body, user.id, user.role);
    res.json({ success: true, data: dados });
  }
};
