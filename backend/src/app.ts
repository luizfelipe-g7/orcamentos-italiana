import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import { errorHandler, notFoundHandler } from './middlewares';
import routes from './routes';
import { env } from './config/env';

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? 'https://seu-dominio.com' : '*',
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});

app.use(limiter);

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
