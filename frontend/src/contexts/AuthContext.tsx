// Force reload 2
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import type { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; senha: string }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  setUserData: (nextUser: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser && savedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser) {
          setUser(parsedUser);
        } else {
          // Se parseou mas retornou null/undefined/falso
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (e) {
        console.error('Erro ao ler usuário do localStorage:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      // Limpa se tiver token mas user inválido
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const setUserData = (nextUser: User) => {
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const refreshMe = async () => {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me');
    const me = response.data?.data;
    if (me) {
      setUserData(me);
    }
  };

  const login = async (credentials: { email: string; senha: string }) => {
    console.log('Tentando fazer login...', credentials);
    // A resposta da API vem no formato { success: true, data: { token, user } }
    const response = await api.post<{ success: boolean; data: { token: string; user: User } }>('/auth/login', credentials);
    console.log('Resposta do login:', response.data);
    
    // O axios coloca o corpo da resposta em response.data
    // E nossa API coloca os dados úteis em response.data.data
    const { token, user } = response.data.data;

    if (!user) {
      console.error('Login falhou: usuário não retornado pela API');
      throw new Error('Erro no login: usuário inválido');
    }

    localStorage.setItem('token', token);
    setUserData(user);
    console.log('Usuário setado no contexto:', user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, refreshMe, setUserData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
