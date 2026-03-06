import { Request, Response } from 'express';
import { documentoService } from '../services/documentoService';
import { AuthenticatedRequest } from '../types';
import { UploadedFile } from '../services/uploadService';

import { createDocumentoSchema, updateDocumentoStatusSchema } from '../schemas/documentoSchema';

export const documentoController = {
  async upload(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const file = req.file as UploadedFile;
    
    // Valida o body usando o schema Zod (necessário pois multipart não passa pelo middleware validate)
    const data = createDocumentoSchema.parse(req.body);
    
    const documento = await documentoService.upload(data, file, user.id, user.role);

    res.status(201).json({
      success: true,
      data: documento,
    });
  },

  async listarPorMembro(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { membroId } = req.params;

    const documentos = await documentoService.listarPorMembro(Number(membroId), user.id, user.role);

    res.json({
      success: true,
      data: documentos,
    });
  },

  async excluir(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    await documentoService.excluir(Number(id), user.id, user.role);

    res.status(204).send();
  },

  async atualizarStatus(req: Request, res: Response) {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const data = updateDocumentoStatusSchema.parse(req.body);

    const documento = await documentoService.atualizarStatus(Number(id), data, user.id, user.role);

    res.json({
      success: true,
      data: documento,
    });
  },
};
