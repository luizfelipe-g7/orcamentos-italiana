import { z } from 'zod';

export const createDocumentoSchema = z.object({
  membro_id: z.string().transform((val) => parseInt(val, 10)).or(z.number()),
  tipo: z.string().min(2, 'Tipo de documento é obrigatório'),
  subtipo: z.string().optional(),
  observacoes: z.string().optional(),
  data_emissao: z.string().optional(),
  data_validade: z.string().optional(),
});

export const updateDocumentoStatusSchema = z.object({
  status: z.enum(['PENDENTE', 'ENVIADO', 'EM_ANALISE', 'APROVADO', 'REJEITADO', 'VENCIDO']),
  observacoes: z.string().optional(),
});

export type CreateDocumentoInput = z.infer<typeof createDocumentoSchema>;
export type UpdateDocumentoStatusInput = z.infer<typeof updateDocumentoStatusSchema>;
