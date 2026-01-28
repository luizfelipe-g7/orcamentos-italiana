import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Middleware de validação usando Zod
 * Valida body, params ou query conforme especificado
 */
export function validate(schema: ZodSchema, target: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[target]);
      req[target] = data; // Substitui pelos dados parseados (já com coerção de tipos)
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};

        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });

        throw new ValidationError('Dados inválidos', formattedErrors);
      }
      throw error;
    }
  };
}

/**
 * Middleware de validação para múltiplos targets
 */
export function validateMultiple(schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const allErrors: Record<string, string[]> = {};

    for (const [target, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      try {
        const data = schema.parse(req[target as keyof typeof req]);
        (req as unknown as Record<string, unknown>)[target] = data;
      } catch (error) {
        if (error instanceof ZodError) {
          error.errors.forEach((err) => {
            const path = `${target}.${err.path.join('.')}`;
            if (!allErrors[path]) {
              allErrors[path] = [];
            }
            allErrors[path].push(err.message);
          });
        }
      }
    }

    if (Object.keys(allErrors).length > 0) {
      throw new ValidationError('Dados inválidos', allErrors);
    }

    next();
  };
}
