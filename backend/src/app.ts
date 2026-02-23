import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import path from 'path';

import { errorHandler, notFoundHandler } from './middlewares';
import routes from './routes';
import { env } from './config/env';

const app = express();

// Middlewares de segurança
app.use(
  helmet({
    // Permite que imagens estáticas de /uploads sejam renderizadas no frontend (origem diferente em dev)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: env.NODE_ENV === 'production' 
      ? 'https://seu-dominio.com' 
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: env.NODE_ENV === 'development' ? 2000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  skip: (req) => {
    // Em desenvolvimento, não bloquear telas de perfil/admin por excesso durante hot reload.
    if (env.NODE_ENV !== 'development') return false;
    return req.path.startsWith('/api/auth/me') || req.path.startsWith('/api/auth/vendedores');
  },
});

app.use(limiter);

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Rotas da API
app.use('/api', routes);

// Handler para rotas não encontradas
app.use(notFoundHandler);

// Handler global de erros
app.use(errorHandler);

export { app };
