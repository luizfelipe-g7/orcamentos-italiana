import bcrypt from 'bcrypt';
import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  },
});

async function createAdmin() {
  const email = 'admin@italiana.com';
  const password = 'admin123'; // Senha simples para teste
  const nome = 'Administrador';

  try {
    console.log(`🔄 Criando/Atualizando usuário admin (${email})...`);

    const passwordHash = await bcrypt.hash(password, 10);

    // Verifica se já existe
    const existingUser = await db('operadores').where({ email }).first();

    if (existingUser) {
      await db('operadores').where({ email }).update({
        senha: passwordHash,
        role: 'ADM',
        ativo: true,
      });
      console.log('✅ Usuário atualizado com sucesso!');
    } else {
      await db('operadores').insert({
        nome,
        email,
        senha: passwordHash,
        role: 'ADM',
        ativo: true,
      });
      console.log('✅ Usuário criado com sucesso!');
    }

    console.log('\n📋 Use estas credenciais:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
  }
}

createAdmin();
