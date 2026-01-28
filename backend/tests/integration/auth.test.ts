import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/config/database';
import bcrypt from 'bcrypt';

describe('Auth Integration', () => {
  beforeAll(async () => {
    // Limpa e prepara o banco
    await db('operadores').del();
    
    // Cria operador de teste
    const senhaHash = await bcrypt.hash('123456', 10);
    await db('operadores').insert({
      nome: 'Teste',
      email: 'teste@teste.com',
      senha: senhaHash,
      role: 'VENDEDOR',
      ativo: true
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teste@teste.com',
        senha: '123456'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user).toHaveProperty('email', 'teste@teste.com');
  });

  it('should fail with invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teste@teste.com',
        senha: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should fail with non-existent user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'naoexiste@teste.com',
        senha: '123456'
      });

    expect(response.status).toBe(401);
  });

  it('should validate input data', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        senha: '123'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Dados inválidos');
  });
});
