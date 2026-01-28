import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { AppError, ValidationError } from '../utils/errors';
import { env } from '../config/env';
import { ApiResponse } from '../types';

/**
 * Middleware global de tratamento de erros
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void {
  // Log do erro
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Erro de validação Zod (se escapou do middleware)
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(err.message);
    });

    res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: formattedErrors,
    });
    return;
  }

  // Erro de validação customizado
  if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      details: error.errors,
    });
    return;
  }

  // Erro customizado da aplicação
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Erro de sintaxe JSON
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      error: 'JSON inválido',
    });
    return;
  }

  // Erro não tratado (500)
  const message =
    env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : error.message || 'Erro interno do servidor';

  res.status(500).json({
    success: false,
    error: message,
  });
}

/**
 * Middleware para rotas não encontradas
 */
export function notFoundHandler(req: Request, res: Response<ApiResponse>): void {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.path}`,
  });
}
