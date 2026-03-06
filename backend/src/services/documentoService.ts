import { documentoRepository } from '../repositories/documentoRepository';
import { membroRepository } from '../repositories/membroRepository';
import { orcamentoRepository } from '../repositories/orcamentoRepository';
import { uploadService, UploadedFile } from './uploadService';
import { CreateDocumentoInput, UpdateDocumentoStatusInput } from '../schemas/documentoSchema';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { UserRole } from '../types';

export const documentoService = {
  async upload(data: CreateDocumentoInput, file: UploadedFile, userId: number, role: UserRole) {
    if (!file) {
      throw new BadRequestError('Arquivo é obrigatório');
    }

    const membroId = Number(data.membro_id);
    const membro = await membroRepository.findById(membroId);

    if (!membro) {
      throw new NotFoundError('Membro não encontrado');
    }

    // Verifica permissão via orçamento
    const orcamento = await orcamentoRepository.findById(membro.orcamento_id);
    if (!orcamento) {
      throw new NotFoundError('Orçamento não encontrado');
    }

    if (role !== 'ADM' && orcamento.operador_id !== userId) {
      throw new ForbiddenError('Você não tem permissão para adicionar documentos neste orçamento');
    }

    // Upload do arquivo
    const url = await uploadService.upload(file);

    // Salva no banco
    return documentoRepository.create({
      membro_id: membroId,
      tipo: data.tipo,
      subtipo: data.subtipo,
      nome_arquivo: file.filename || file.originalname, // filename vem do multer diskStorage ou originalname
      nome_original: file.originalname,
      url_s3: url,
      mime_type: file.mimetype,
      tamanho_bytes: file.size,
      status: 'PENDENTE',
      observacoes: data.observacoes,
      uploaded_by: userId,
      data_emissao: data.data_emissao ? new Date(data.data_emissao) : undefined,
      data_validade: data.data_validade ? new Date(data.data_validade) : undefined,
    });
  },

  async listarPorMembro(membroId: number, userId: number, role: UserRole) {
    const membro = await membroRepository.findById(membroId);
    if (!membro) throw new NotFoundError('Membro não encontrado');

    const orcamento = await orcamentoRepository.findById(membro.orcamento_id);
    if (role !== 'ADM' && orcamento?.operador_id !== userId) {
      throw new ForbiddenError('Sem permissão');
    }

    return documentoRepository.findByMembro(membroId);
  },

  async excluir(id: number, userId: number, role: UserRole) {
    const documento = await documentoRepository.findById(id);
    if (!documento) throw new NotFoundError('Documento não encontrado');

    const membro = await membroRepository.findById(documento.membro_id);
    const orcamento = await orcamentoRepository.findById(membro!.orcamento_id);

    if (role !== 'ADM' && orcamento?.operador_id !== userId) {
      throw new ForbiddenError('Sem permissão');
    }

    // TODO: Deletar do S3 também (futuro)
    return documentoRepository.delete(id);
  },

  async atualizarStatus(id: number, data: UpdateDocumentoStatusInput, userId: number, role: UserRole) {
    const documento = await documentoRepository.findById(id);
    if (!documento) throw new NotFoundError('Documento não encontrado');

    const membro = await membroRepository.findById(documento.membro_id);
    if (!membro) throw new NotFoundError('Membro não encontrado');

    const orcamento = await orcamentoRepository.findById(membro.orcamento_id);
    if (role !== 'ADM' && orcamento?.operador_id !== userId) {
      throw new ForbiddenError('Sem permissão');
    }

    return documentoRepository.updateStatus(id, data.status, data.observacoes);
  },
};
