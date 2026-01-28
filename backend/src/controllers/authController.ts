import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../types';

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      data: result,
    });
  },

  async me(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    
    // Retorna os dados do usuário extraídos do token
    // Em um cenário real, poderíamos buscar dados atualizados do banco aqui
    res.json({
      success: true,
      data: user,
    });
  },
};
