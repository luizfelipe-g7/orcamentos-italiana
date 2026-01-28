/**
 * Script utilitário para gerar hash de senha
 * 
 * Uso:
 *   npx ts-node scripts/generate-hash.ts <senha>
 *   
 * Exemplo:
 *   npx ts-node scripts/generate-hash.ts minhasenha123
 */

import bcrypt from 'bcrypt';

async function generateHash() {
  const senha = process.argv[2];

  if (!senha) {
    console.log('❌ Uso: npx ts-node scripts/generate-hash.ts <senha>');
    console.log('   Exemplo: npx ts-node scripts/generate-hash.ts minhasenha123');
    process.exit(1);
  }

  const hash = await bcrypt.hash(senha, 10);

  console.log('\n🔐 Hash gerado com sucesso!\n');
  console.log(`Senha original: ${senha}`);
  console.log(`Hash bcrypt:    ${hash}`);
  console.log('\n📋 SQL para inserir:');
  console.log(`INSERT INTO operadores (nome, email, senha, role, ativo) VALUES`);
  console.log(`('Nome do Usuário', 'email@exemplo.com', '${hash}', 'VENDEDOR', TRUE);`);
}

generateHash();
