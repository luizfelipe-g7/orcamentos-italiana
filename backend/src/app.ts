import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
