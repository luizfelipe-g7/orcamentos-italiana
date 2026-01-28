import { Request } from 'express';

// Roles dos operadores
export type UserRole = 'ADM' | 'VENDEDOR';

// Payload do JWT
export interface JwtPayload {
  id: number;
  email: string;
  nome: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Request autenticada (com usuário)
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

// Tipos de cidadania
export type CidadaniaType = 'IT' | 'PT';

// Status de orçamento
export type OrcamentoStatus = 'ABERTO' | 'FECHADO' | 'CANCELADO' | 'EM_ANDAMENTO';

// Status de documento
export type DocumentoStatus = 'PENDENTE' | 'ENVIADO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'VENCIDO';

// Status de assinatura digital
export type AssinaturaStatus = 'NAO_REQUER' | 'PENDENTE' | 'ENVIADO' | 'ASSINADO' | 'RECUSADO';

// Status de parcela
export type ParcelaStatus = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';

// Tipo de processo de cidadania
export type ProcessoTipo = 'JUDICIAL' | 'ADMINISTRATIVO' | 'CONSULADO';

// Status do processo de cidadania
export type ProcessoStatus = 
  | 'AGUARDANDO_DOCUMENTOS'
  | 'DOCUMENTOS_EM_ANALISE'
  | 'AGUARDANDO_TRADUCAO'
  | 'AGUARDANDO_APOSTILAMENTO'
  | 'PRONTO_PARA_PROTOCOLO'
  | 'PROTOCOLADO'
  | 'EM_ANALISE_CONSULADO'
  | 'EM_ANALISE_TRIBUNAL'
  | 'AGUARDANDO_SENTENCA'
  | 'SENTENCA_FAVORAVEL'
  | 'SENTENCA_DESFAVORAVEL'
  | 'CIDADANIA_RECONHECIDA'
  | 'CONCLUIDO'
  | 'CANCELADO';

// Resposta padrão da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

// Paginação
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Entidades do banco
export interface Operador {
  id: number;
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Orcamento {
  id: number;
  nome_familia: string;
  cidadania: CidadaniaType;
  status: OrcamentoStatus;
  valor_total?: number;
  num_parcelas?: number;
  operador_id: number;
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Membro {
  id: number;
  orcamento_id: number;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  parentesco?: string;
  data_nascimento?: Date;
  requerente: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Documento {
  id: number;
  membro_id: number;
  tipo: string;
  nome_arquivo: string;
  url_s3: string;
  status: DocumentoStatus;
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}
