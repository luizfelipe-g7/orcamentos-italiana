/**
 * Script para criar usuários iniciais com senhas criptografadas
 * 
 * Uso:
 *   npx ts-node scripts/seed-users.ts
 *   ou
 *   npm run seed:users
 */

import bcrypt from 'bcrypt';
import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do banco
const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Supabase requer SSL
  },
});

// Usuários iniciais
const usuarios = [
  {
    nome: 'Administrador',
    email: 'admin@assessoria.com',
    senha: 'admin123', // Será criptografada
    role: 'ADM',
    ativo: true,
  },
  {
    nome: 'Vendedor Teste',
    email: 'vendedor@assessoria.com',
    senha: 'vendedor123', // Será criptografada
    role: 'VENDEDOR',
    ativo: true,
  },
];

async function seedUsers() {
  console.log('🔄 Iniciando seed de usuários...\n');

  try {
    for (const usuario of usuarios) {
      // Verifica se já existe
      const existente = await db('operadores').where({ email: usuario.email }).first();

      if (existente) {
        console.log(`⚠️  Usuário ${usuario.email} já existe, pulando...`);
        continue;
      }

      // Criptografa a senha
      const senhaHash = await bcrypt.hash(usuario.senha, 10);

      // Insere no banco
      await db('operadores').insert({
        nome: usuario.nome,
        email: usuario.email,
        senha: senhaHash,
        role: usuario.role,
        ativo: usuario.ativo,
      });

      console.log(`✅ Usuário criado: ${usuario.email} (${usuario.role})`);
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('   Admin: admin@assessoria.com / admin123');
    console.log('   Vendedor: vendedor@assessoria.com / vendedor123');
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seedUsers();
