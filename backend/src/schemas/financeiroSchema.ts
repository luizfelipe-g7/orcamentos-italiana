import { z } from 'zod';

// Honorário
export const honorarioSchema = z.object({
  orcamento_id: z.number().int().positive(),
  descricao: z.string().min(3),
  detalhes: z.string().optional(),
  valor: z.number().positive(),
  quantidade: z.number().int().positive().default(1),
  desconto: z.number().min(0).default(0),
  // valor_final é calculado no backend
});

// Parcela
export const parcelaSchema = z.object({
  numero_parcela: z.number().int().positive(),
  valor: z.number().positive(),
  data_vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato deve ser YYYY-MM-DD'),
  status: z.enum(['PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO']).default('PENDENTE'),
  data_pagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  valor_pago: z.number().positive().optional(),
  forma_pagamento: z.string().optional(),
  comprovante_url: z.string().optional(),
  observacoes: z.string().optional(),
});

// Pagante
export const paganteSchema = z.object({
  orcamento_id: z.number().int().positive(),
  membro_id: z.number().int().positive().optional(),
  nome: z.string().min(2),
  cpf: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  valor_total: z.number().positive(),
  num_parcelas: z.number().int().positive().default(1),
  valor_entrada: z.number().min(0).optional(),
  observacoes: z.string().optional(),
  parcelas: z.array(parcelaSchema).optional(), // Pode criar parcelas junto
});

export type CreateHonorarioInput = z.infer<typeof honorarioSchema>;
export type CreatePaganteInput = z.infer<typeof paganteSchema>;
export type CreateParcelaInput = z.infer<typeof parcelaSchema>;
