import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { operadorRepository } from '../repositories/operadorRepository';
import { CreateVendedorInput, LoginInput, UpdatePhotoInput, UpdateProfileInput, UpdateVendedorInput } from '../schemas/authSchema';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { env } from '../config/env';
import { JwtPayload, Operador, UserRole } from '../types';

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

  async me(userId: number) {
    const operador = await operadorRepository.findById(userId);
    if (!operador) throw new NotFoundError('Usuário não encontrado');
    const { senha, ...operadorSemSenha } = operador;
    return operadorSemSenha;
  },

  async updateMyPhoto(userId: number, data: UpdatePhotoInput) {
    const updated = await operadorRepository.update(userId, {
      foto_url: data.foto_url,
    });
    if (!updated) throw new NotFoundError('Usuário não encontrado');
    const { senha, ...operadorSemSenha } = updated;
    return operadorSemSenha;
  },

  async updateMyProfile(userId: number, role: UserRole, data: UpdateProfileInput) {
    // Regra solicitada: apenas ADM altera nome/email/senha.
    if (role !== 'ADM') {
      throw new ForbiddenError('Apenas administradores podem alterar nome, email e senha.');
    }

    const payload: Partial<Operador> = {};

    if (typeof data.nome === 'string') payload.nome = data.nome;
    if (typeof data.email === 'string') {
      const existing = await operadorRepository.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw new ConflictError('Este email já está em uso.');
      }
      payload.email = data.email;
    }
    if (typeof data.foto_url === 'string') payload.foto_url = data.foto_url || null;
    if (typeof data.senha === 'string') payload.senha = await bcrypt.hash(data.senha, 10);

    const updated = await operadorRepository.update(userId, payload);
    if (!updated) throw new NotFoundError('Usuário não encontrado');
    const { senha, ...operadorSemSenha } = updated;
    return operadorSemSenha;
  },

  async listarVendedores() {
    const vendedores = await operadorRepository.findAllVendedores();
    return vendedores.map(({ senha, ...resto }) => resto);
  },

  async criarVendedor(data: CreateVendedorInput) {
    const existente = await operadorRepository.findByEmail(data.email);
    if (existente) {
      throw new ConflictError('Já existe um usuário com este email.');
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);
    const created = await operadorRepository.create({
      nome: data.nome,
      email: data.email,
      senha: senhaHash,
      role: 'VENDEDOR',
      ativo: data.ativo ?? true,
      foto_url: data.foto_url || null,
    });
    const { senha, ...operadorSemSenha } = created;
    return operadorSemSenha;
  },

  async atualizarVendedor(id: number, data: UpdateVendedorInput) {
    const vendedor = await operadorRepository.findById(id);
    if (!vendedor || vendedor.role !== 'VENDEDOR') {
      throw new NotFoundError('Vendedor não encontrado.');
    }

    const payload: Partial<Operador> = {};
    if (typeof data.nome === 'string') payload.nome = data.nome;
    if (typeof data.email === 'string') {
      const existing = await operadorRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictError('Este email já está em uso.');
      }
      payload.email = data.email;
    }
    if (typeof data.senha === 'string') payload.senha = await bcrypt.hash(data.senha, 10);
    if (typeof data.ativo === 'boolean') payload.ativo = data.ativo;
    if (typeof data.foto_url === 'string') payload.foto_url = data.foto_url || null;

    const updated = await operadorRepository.update(id, payload);
    if (!updated) throw new NotFoundError('Vendedor não encontrado.');
    const { senha, ...operadorSemSenha } = updated;
    return operadorSemSenha;
  },
};
