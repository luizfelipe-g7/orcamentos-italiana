export interface User {
  id: number;
  nome: string;
  email: string;
  role: 'ADM' | 'VENDEDOR';
  ativo?: boolean;
  foto_url?: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}
