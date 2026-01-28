import { Request, Response } from 'express';
import { membroService } from '../services/membroService';
import { AuthenticatedRequest } from '../types';

export const membroController = {
  async listarPorOrcamento(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { orcamentoId } = req.params;

    const membros = await membroService.listarPorOrcamento(Number(orcamentoId), user.id, user.role);

    res.json({
      success: true,
      data: membros,
    });
  },

  async buscarPorId(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const membro = await membroService.buscarPorId(Number(id), user.id, user.role);

    res.json({
      success: true,
      data: membro,
    });
  },

  async criar(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const membro = await membroService.criar(req.body, user.id, user.role);

    res.status(201).json({
      success: true,
      data: membro,
    });
  },

  async atualizar(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const membro = await membroService.atualizar(Number(id), req.body, user.id, user.role);

    res.json({
      success: true,
      data: membro,
    });
  },

  async excluir(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    await membroService.excluir(Number(id), user.id, user.role);

    res.status(204).send();
  },
};
