import { z } from 'zod';

export const createOrcamentoSchema = z.object({
  nome_familia: z.string().min(2, 'Nome da família deve ter no mínimo 2 caracteres'),
  cidadania: z.enum(['IT'], {
    errorMap: () => ({ message: 'Cidadania deve ser IT' }),
  }),
  observacoes: z.string().optional(),
  // Campos financeiros iniciais opcionais
  valor_total: z.number().positive().optional(),
  num_parcelas: z.number().int().min(1).max(24).optional(),
});

export const updateOrcamentoSchema = createOrcamentoSchema.partial().extend({
  status: z.enum(['ABERTO', 'FECHADO', 'CANCELADO', 'EM_ANDAMENTO']).optional(),
  bitrix_deal_id: z.string().optional(),
  data_fechamento: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  previsao_inicio: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export type CreateOrcamentoInput = z.infer<typeof createOrcamentoSchema>;
export type UpdateOrcamentoInput = z.infer<typeof updateOrcamentoSchema>;
