import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../types';
import { UploadedFile, uploadService } from '../services/uploadService';

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
    const me = await authService.me(user.id);
    res.json({
      success: true,
      data: me,
    });
  },

  async updateMyPhoto(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const updated = await authService.updateMyPhoto(user.id, req.body);
    res.json({
      success: true,
      data: updated,
    });
  },

  async uploadMyPhotoFile(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const file = req.file as UploadedFile | undefined;

    if (!file) {
      res.status(400).json({
        success: false,
        error: 'Arquivo de foto não enviado.',
      });
      return;
    }

    const uploadedPath = await uploadService.upload(file);
    const fotoUrl = uploadedPath.startsWith('/uploads')
      ? `${req.protocol}://${req.get('host')}${uploadedPath}`
      : uploadedPath;

    const updated = await authService.updateMyPhoto(user.id, { foto_url: fotoUrl });

    res.json({
      success: true,
      data: updated,
    });
  },

  async updateMyProfile(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const updated = await authService.updateMyProfile(user.id, user.role, req.body);
    res.json({
      success: true,
      data: updated,
    });
  },

  async listarVendedores(_req: Request, res: Response) {
    const vendedores = await authService.listarVendedores();
    res.json({
      success: true,
      data: vendedores,
    });
  },

  async criarVendedor(req: Request, res: Response) {
    const vendedor = await authService.criarVendedor(req.body);
    res.status(201).json({
      success: true,
      data: vendedor,
    });
  },

  async atualizarVendedor(req: Request, res: Response) {
    const { id } = req.params;
    const vendedor = await authService.atualizarVendedor(Number(id), req.body);
    res.json({
      success: true,
      data: vendedor,
    });
  },
};
