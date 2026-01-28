import { z } from 'zod';

export const createMembroSchema = z.object({
  orcamento_id: z.number().int().positive('ID do orçamento inválido'),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cpf: z.string().optional(), // Poderia adicionar validação de formato
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  parentesco: z.string().optional(),
  data_nascimento: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  requerente: z.boolean().default(false),
  dante_causa: z.boolean().default(false),
  pagante: z.boolean().default(false),
  nacionalidade: z.string().default('Brasileira'),
  estado_civil: z.string().optional(),
  profissao: z.string().optional(),
  observacoes: z.string().optional(),
});

export const updateMembroSchema = createMembroSchema.partial().omit({ orcamento_id: true });

export type CreateMembroInput = z.infer<typeof createMembroSchema>;
export type UpdateMembroInput = z.infer<typeof updateMembroSchema>;
