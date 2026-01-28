import { Request, Response } from 'express';
import { orcamentoService } from '../services/orcamentoService';
import { AuthenticatedRequest } from '../types';

export const orcamentoController = {
  async listar(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    
    const filters = {
      status: req.query.status as any,
      cidadania: req.query.cidadania as any,
    };

    const result = await orcamentoService.listar(page, limit, user.id, user.role, filters);
    
    res.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  },

  async buscarPorId(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const orcamento = await orcamentoService.buscarPorId(Number(id), user.id, user.role);

    res.json({
      success: true,
      data: orcamento,
    });
  },

  async criar(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const orcamento = await orcamentoService.criar(req.body, user.id);

    res.status(201).json({
      success: true,
      data: orcamento,
    });
  },

  async atualizar(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const orcamento = await orcamentoService.atualizar(Number(id), req.body, user.id, user.role);

    res.json({
      success: true,
      data: orcamento,
    });
  },

  async excluir(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    await orcamentoService.excluir(Number(id), user.id, user.role);

    res.status(204).send();
  },
};
