import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/config/database';
import bcrypt from 'bcrypt';
import { env } from '../../src/config/env';
import jwt from 'jsonwebtoken';

describe('Membro Integration', () => {
  let vendedorToken: string;
  let vendedorId: number;
  let orcamentoId: number;

  beforeAll(async () => {
    await db('membros').del();
    await db('orcamentos').del();
    await db('operadores').del();

    const senhaHash = await bcrypt.hash('123456', 10);
    const [vendedor] = await db('operadores').insert({
      nome: 'Vendedor Membro',
      email: 'vendedor_membro@teste.com',
      senha: senhaHash,
      role: 'VENDEDOR',
      ativo: true
    }).returning('*');
    vendedorId = vendedor.id;

    vendedorToken = jwt.sign({ id: vendedor.id, email: vendedor.email, role: vendedor.role, nome: vendedor.nome }, env.JWT_SECRET);

    const [orcamento] = await db('orcamentos').insert({
      nome_familia: 'Família Membros',
      cidadania: 'IT',
      status: 'ABERTO',
      operador_id: vendedorId
    }).returning('id');
    orcamentoId = orcamento.id;
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('POST /api/membros', () => {
    it('should create a new member', async () => {
      const response = await request(app)
        .post('/api/membros')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          orcamento_id: orcamentoId,
          nome: 'João da Silva',
          cpf: '12345678900',
          requerente: true,
          nacionalidade: 'Brasileira'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe('João da Silva');
      expect(response.body.data.orcamento_id).toBe(orcamentoId);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/membros')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          orcamento_id: orcamentoId,
          // Faltando nome
          cpf: '12345678900'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/membros/orcamento/:id', () => {
    it('should list members of a budget', async () => {
      const response = await request(app)
        .get(`/api/membros/orcamento/${orcamentoId}`)
        .set('Authorization', `Bearer ${vendedorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/membros/:id', () => {
    let membroId: number;

    beforeEach(async () => {
      const [membro] = await db('membros').insert({
        orcamento_id: orcamentoId,
        nome: 'Membro Update',
        requerente: false
      }).returning('id');
      membroId = membro.id;
    });

    it('should update a member', async () => {
      const response = await request(app)
        .put(`/api/membros/${membroId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          nome: 'Membro Atualizado',
          requerente: true
        });

      expect(response.status).toBe(200);
      expect(response.body.data.nome).toBe('Membro Atualizado');
      expect(response.body.data.requerente).toBe(true);
    });
  });

  describe('DELETE /api/membros/:id', () => {
    let membroId: number;

    beforeEach(async () => {
      const [membro] = await db('membros').insert({
        orcamento_id: orcamentoId,
        nome: 'Membro Delete',
        requerente: false
      }).returning('id');
      membroId = membro.id;
    });

    it('should delete a member', async () => {
      const response = await request(app)
        .delete(`/api/membros/${membroId}`)
        .set('Authorization', `Bearer ${vendedorToken}`);

      expect(response.status).toBe(204);

      const check = await db('membros').where({ id: membroId }).first();
      expect(check).toBeUndefined();
    });
  });
});
