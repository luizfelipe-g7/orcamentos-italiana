import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/config/database';
import bcrypt from 'bcrypt';
import { env } from '../../src/config/env';
import jwt from 'jsonwebtoken';

describe('Financeiro Integration', () => {
  let vendedorToken: string;
  let vendedorId: number;
  let orcamentoId: number;

  beforeAll(async () => {
    await db('parcelas').del();
    await db('pagantes').del();
    await db('honorarios').del();
    await db('orcamentos').del();
    await db('operadores').del();

    // Cria Vendedor
    const senhaHash = await bcrypt.hash('123456', 10);
    const [vendedor] = await db('operadores').insert({
      nome: 'Vendedor Financeiro',
      email: 'vendedor_fin@teste.com',
      senha: senhaHash,
      role: 'VENDEDOR',
      ativo: true
    }).returning('*');
    vendedorId = vendedor.id;

    vendedorToken = jwt.sign({ id: vendedor.id, email: vendedor.email, role: vendedor.role, nome: vendedor.nome }, env.JWT_SECRET);

    // Cria Orçamento
    const [orcamento] = await db('orcamentos').insert({
      nome_familia: 'Família Financeiro',
      cidadania: 'IT',
      status: 'ABERTO',
      operador_id: vendedorId
    }).returning('id');
    orcamentoId = orcamento.id;
  });

  afterAll(async () => {
    await db.destroy();
  });

  // --- Honorários ---
  describe('Honorários', () => {
    let honorarioId: number;

    it('should create an honorario', async () => {
      const response = await request(app)
        .post('/api/financeiro/honorarios')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          orcamento_id: orcamentoId,
          descricao: 'Assessoria Completa',
          valor: 5000,
          quantidade: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.data.valor_final).toBe('5000.00');
      honorarioId = response.body.data.id;
    });

    it('should list honorarios', async () => {
      const response = await request(app)
        .get(`/api/financeiro/honorarios/${orcamentoId}`)
        .set('Authorization', `Bearer ${vendedorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should delete honorario', async () => {
      const response = await request(app)
        .delete(`/api/financeiro/honorarios/${honorarioId}`)
        .set('Authorization', `Bearer ${vendedorToken}`);

      expect(response.status).toBe(204);
    });
  });

  // --- Pagantes e Parcelas ---
  describe('Pagantes e Parcelas', () => {
    let paganteId: number;
    let parcelaId: number;

    it('should create a pagante with parcelas', async () => {
      const response = await request(app)
        .post('/api/financeiro/pagantes')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          orcamento_id: orcamentoId,
          nome: 'Pagante Teste',
          valor_total: 1000,
          num_parcelas: 2,
          parcelas: [
            {
              numero_parcela: 1,
              valor: 500,
              data_vencimento: '2026-02-01'
            },
            {
              numero_parcela: 2,
              valor: 500,
              data_vencimento: '2026-03-01'
            }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.data.nome).toBe('Pagante Teste');
      paganteId = response.body.data.id;
    });

    it('should list pagantes with parcelas', async () => {
      const response = await request(app)
        .get(`/api/financeiro/pagantes/${orcamentoId}`)
        .set('Authorization', `Bearer ${vendedorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].parcelas.length).toBe(2);
      parcelaId = response.body.data[0].parcelas[0].id;
    });

    it('should update parcela status', async () => {
      const response = await request(app)
        .put(`/api/financeiro/parcelas/${parcelaId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          status: 'PAGO',
          data_pagamento: '2026-02-01',
          valor_pago: 500
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('PAGO');
    });

    it('should delete pagante', async () => {
      const response = await request(app)
        .delete(`/api/financeiro/pagantes/${paganteId}`)
        .set('Authorization', `Bearer ${vendedorToken}`);

      expect(response.status).toBe(204);
    });
  });
});
