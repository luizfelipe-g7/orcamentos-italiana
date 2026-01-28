import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('membros', (table) => {
    table.increments('id').primary();
    
    // Relacionamento com orçamento
    table.integer('orcamento_id').unsigned().notNullable();
    table.foreign('orcamento_id')
      .references('id')
      .inTable('orcamentos')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    // Dados pessoais
    table.string('nome', 150).notNullable();
    table.string('cpf', 14).nullable(); // 000.000.000-00
    table.string('rg', 20).nullable();
    table.string('email', 150).nullable();
    table.string('telefone', 20).nullable();
    table.date('data_nascimento').nullable();
    table.string('naturalidade', 100).nullable();
    table.string('nacionalidade', 50).nullable().defaultTo('Brasileira');
    
    // Endereço
    table.string('cep', 10).nullable();
    table.string('endereco', 200).nullable();
    table.string('numero', 20).nullable();
    table.string('complemento', 100).nullable();
    table.string('bairro', 100).nullable();
    table.string('cidade', 100).nullable();
    table.string('estado', 2).nullable();
    
    // Parentesco e papel no processo
    table.string('parentesco', 50).nullable(); // Pai, Mãe, Filho, Cônjuge, etc.
    table.boolean('requerente').notNullable().defaultTo(false);
    table.boolean('pagante').notNullable().defaultTo(false);
    table.boolean('dante_causa').notNullable().defaultTo(false); // Ancestral italiano/português
    
    // Estado civil (importante para cidadania)
    table.string('estado_civil', 30).nullable();
    table.string('profissao', 100).nullable();
    
    table.text('observacoes').nullable();
    
    table.timestamps(true, true);
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_membros_orcamento ON membros(orcamento_id)');
  await knex.schema.raw('CREATE INDEX idx_membros_cpf ON membros(cpf)');
  await knex.schema.raw('CREATE INDEX idx_membros_requerente ON membros(requerente)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('membros');
}
