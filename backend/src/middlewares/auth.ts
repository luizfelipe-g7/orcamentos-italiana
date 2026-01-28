import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { JwtPayload, AuthenticatedRequest, UserRole } from '../types';

/**
 * Middleware de autenticação JWT
 * Valida o token e adiciona o usuário ao request
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError('Token não fornecido');
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    throw new UnauthorizedError('Token mal formatado');
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    throw new UnauthorizedError('Token mal formatado');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Token inválido');
    }
    throw new UnauthorizedError('Falha na autenticação');
  }
}

/**
 * Middleware de autorização por role
 * Verifica se o usuário tem uma das roles permitidas
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { user } = req as AuthenticatedRequest;

    if (!user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError('Você não tem permissão para acessar este recurso');
    }

    next();
  };
}

/**
 * Middleware opcional de autenticação
 * Adiciona usuário ao request se token existir, mas não bloqueia se não existir
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
    return next();
  }

  try {
    const decoded = jwt.verify(parts[1], env.JWT_SECRET) as JwtPayload;
    (req as AuthenticatedRequest).user = decoded;
  } catch {
    // Token inválido, mas não bloqueia
  }

  next();
}
