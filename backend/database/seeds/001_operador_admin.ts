import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Limpa a tabela (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    await knex('operadores').del();
  }

  // Cria hash da senha
  const senhaHash = await bcrypt.hash('admin123', 10);

  // Insere operador admin
  await knex('operadores').insert([
    {
      nome: 'Administrador',
      email: 'admin@assessoria.com',
      senha: senhaHash,
      role: 'ADM',
      ativo: true,
    },
    {
      nome: 'Vendedor Teste',
      email: 'vendedor@assessoria.com',
      senha: await bcrypt.hash('vendedor123', 10),
      role: 'VENDEDOR',
      ativo: true,
    },
  ]);
}
