import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const updateProfileSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  foto_url: z.string().url('URL da foto inválida').optional().or(z.literal('')),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
});

export const updatePhotoSchema = z.object({
  foto_url: z.string().url('URL da foto inválida'),
});

export const createVendedorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  ativo: z.boolean().optional(),
  foto_url: z.string().url('URL da foto inválida').optional().or(z.literal('')),
});

export const updateVendedorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  ativo: z.boolean().optional(),
  foto_url: z.string().url('URL da foto inválida').optional().or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;
export type CreateVendedorInput = z.infer<typeof createVendedorSchema>;
export type UpdateVendedorInput = z.infer<typeof updateVendedorSchema>;
