import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/config/database';
import bcrypt from 'bcrypt';
import { env } from '../../src/config/env';
import jwt from 'jsonwebtoken';

describe('Orcamento Integration', () => {
  // let adminToken: string;
  let vendedorToken: string;
  // let adminId: number;
  let vendedorId: number;

  beforeAll(async () => {
    // Limpa tabelas
    await db('orcamentos').del();
    await db('operadores').del();

    // Cria Admin
    const senhaHash = await bcrypt.hash('123456', 10);
    /* const [admin] = */ await db('operadores').insert({
      nome: 'Admin',
      email: 'admin@teste.com',
      senha: senhaHash,
      role: 'ADM',
      ativo: true
    }).returning('*');
    // adminId = admin.id;

    // Cria Vendedor
    const [vendedor] = await db('operadores').insert({
      nome: 'Vendedor',
      email: 'vendedor@teste.com',
      senha: senhaHash,
      role: 'VENDEDOR',
      ativo: true
    }).returning('*');
    vendedorId = vendedor.id;

    // Gera tokens
    // adminToken = jwt.sign({ id: admin.id, email: admin.email, role: admin.role, nome: admin.nome }, env.JWT_SECRET);
    vendedorToken = jwt.sign({ id: vendedor.id, email: vendedor.email, role: vendedor.role, nome: vendedor.nome }, env.JWT_SECRET);
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('POST /api/orcamentos', () => {
    it('should create a new budget', async () => {
      const response = await request(app)
        .post('/api/orcamentos')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          nome_familia: 'Família Teste',
          cidadania: 'IT',
          observacoes: 'Teste de criação'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nome_familia).toBe('Família Teste');
      expect(response.body.data.status).toBe('ABERTO');
      expect(response.body.data.operador_id).toBe(vendedorId);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/orcamentos')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          // Faltando nome_familia e cidadania
          observacoes: 'Teste inválido'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Dados inválidos');
    });
  });

  describe('GET /api/orcamentos', () => {
    it('should list budgets', async () => {
      const response = await request(app)
        .get('/api/orcamentos')
        .set('Authorization', `Bearer ${vendedorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/orcamentos?status=ABERTO')
        .set('Authorization', `Bearer ${vendedorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].status).toBe('ABERTO');
    });
  });

  describe('PUT /api/orcamentos/:id', () => {
    let orcamentoId: number;

    beforeEach(async () => {
      const [orcamento] = await db('orcamentos').insert({
        nome_familia: 'Família Update',
        cidadania: 'PT',
        status: 'ABERTO',
        operador_id: vendedorId
      }).returning('id');
      orcamentoId = orcamento.id;
    });

    it('should update a budget', async () => {
      const response = await request(app)
        .put(`/api/orcamentos/${orcamentoId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          nome_familia: 'Família Atualizada',
          valor_total: 5000
        });

      expect(response.status).toBe(200);
      expect(response.body.data.nome_familia).toBe('Família Atualizada');
      expect(response.body.data.valor_total).toBe('5000.00');
    });
  });
});
