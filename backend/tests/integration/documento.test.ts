import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/config/database';
import bcrypt from 'bcrypt';
import { env } from '../../src/config/env';
import jwt from 'jsonwebtoken';
// import path from 'path';

describe('Documento Integration', () => {
  let vendedorToken: string;
  let vendedorId: number;
  let orcamentoId: number;
  let membroId: number;

  beforeAll(async () => {
    await db('documentos').del();
    await db('membros').del();
    await db('orcamentos').del();
    await db('operadores').del();

    // Cria Vendedor
    const senhaHash = await bcrypt.hash('123456', 10);
    const [vendedor] = await db('operadores').insert({
      nome: 'Vendedor Docs',
      email: 'vendedor_docs@teste.com',
      senha: senhaHash,
      role: 'VENDEDOR',
      ativo: true
    }).returning('*');
    vendedorId = vendedor.id;

    vendedorToken = jwt.sign({ id: vendedor.id, email: vendedor.email, role: vendedor.role, nome: vendedor.nome }, env.JWT_SECRET);

    // Cria Orçamento
    const [orcamento] = await db('orcamentos').insert({
      nome_familia: 'Família Docs',
      cidadania: 'IT',
      status: 'ABERTO',
      operador_id: vendedorId
    }).returning('id');
    orcamentoId = orcamento.id;

    // Cria Membro
    const [membro] = await db('membros').insert({
      orcamento_id: orcamentoId,
      nome: 'Membro com Doc',
      requerente: true
    }).returning('id');
    membroId = membro.id;
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('POST /api/documentos/upload', () => {
    it('should upload a document', async () => {
      const response = await request(app)
        .post('/api/documentos/upload')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .field('membro_id', membroId)
        .field('tipo', 'rg')
        .field('observacoes', 'Teste de upload')
        .attach('arquivo', Buffer.from('conteudo do arquivo teste'), 'teste.txt');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nome_original).toBe('teste.txt');
      expect(response.body.data.membro_id).toBe(membroId);
      expect(response.body.data.url_s3).toContain('/uploads/'); // Verifica se usou o upload local
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/documentos/upload')
        .set('Authorization', `Bearer ${vendedorToken}`)
        // Faltando membro_id e tipo
        .attach('arquivo', Buffer.from('conteudo'), 'teste.txt');

      expect(response.status).toBe(400);
    });

    it('should validate file presence', async () => {
      const response = await request(app)
        .post('/api/documentos/upload')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .field('membro_id', membroId)
        .field('tipo', 'rg');
        // Sem arquivo

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/documentos/membro/:id', () => {
    it('should list documents of a member', async () => {
      const response = await request(app)
        .get(`/api/documentos/membro/${membroId}`)
        .set('Authorization', `Bearer ${vendedorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/documentos/:id', () => {
    let docId: number;

    beforeEach(async () => {
      const [doc] = await db('documentos').insert({
        membro_id: membroId,
        tipo: 'cpf',
        nome_arquivo: 'delete_me.txt',
        nome_original: 'delete_me.txt',
        url_s3: '/uploads/delete_me.txt',
        uploaded_by: vendedorId
      }).returning('id');
      docId = doc.id;
    });

    it('should delete a document', async () => {
      const response = await request(app)
        .delete(`/api/documentos/${docId}`)
        .set('Authorization', `Bearer ${vendedorToken}`);

      expect(response.status).toBe(204);

      const check = await db('documentos').where({ id: docId }).first();
      expect(check).toBeUndefined();
    });
  });
});
