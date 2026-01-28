import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { operadorRepository } from '../repositories/operadorRepository';
import { LoginInput } from '../schemas/authSchema';
import { UnauthorizedError } from '../utils/errors';
import { env } from '../config/env';
import { JwtPayload, Operador } from '../types';

export const authService = {
  async login(data: LoginInput) {
    const operador = await operadorRepository.findByEmail(data.email);

    if (!operador) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    if (!operador.ativo) {
      throw new UnauthorizedError('Usuário inativo');
    }

    const senhaValida = await bcrypt.compare(data.senha, operador.senha);

    if (!senhaValida) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    const token = this.generateToken(operador);

    // Remove a senha do objeto retornado
    const { senha, ...operadorSemSenha } = operador;

    return {
      user: operadorSemSenha,
      token,
    };
  },

  generateToken(operador: Operador): string {
    const payload: JwtPayload = {
      id: operador.id,
      email: operador.email,
      nome: operador.nome,
      role: operador.role,
    };

    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as any,
    };

    return jwt.sign(payload, env.JWT_SECRET, options);
  },
};
