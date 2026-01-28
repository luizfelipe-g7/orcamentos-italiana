import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Tabela de pagantes (quem paga pelo serviço)
  await knex.schema.createTable('pagantes', (table) => {
    table.increments('id').primary();
    
    // Relacionamento com orçamento
    table.integer('orcamento_id').unsigned().notNullable();
    table.foreign('orcamento_id')
      .references('id')
      .inTable('orcamentos')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    // Relacionamento com membro (opcional - pode ser alguém de fora da família)
    table.integer('membro_id').unsigned().nullable();
    table.foreign('membro_id')
      .references('id')
      .inTable('membros')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');
    
    // Dados do pagante (caso não seja membro)
    table.string('nome', 150).notNullable();
    table.string('cpf', 14).nullable();
    table.string('email', 150).nullable();
    table.string('telefone', 20).nullable();
    
    // Valores
    table.decimal('valor_total', 12, 2).notNullable();
    table.integer('num_parcelas').notNullable().defaultTo(1);
    table.decimal('valor_entrada', 12, 2).nullable();
    
    table.text('observacoes').nullable();
    
    table.timestamps(true, true);
  });

  // Tabela de parcelas
  await knex.schema.createTable('parcelas', (table) => {
    table.increments('id').primary();
    
    // Relacionamento com pagante
    table.integer('pagante_id').unsigned().notNullable();
    table.foreign('pagante_id')
      .references('id')
      .inTable('pagantes')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    // Dados da parcela
    table.integer('numero_parcela').notNullable();
    table.decimal('valor', 12, 2).notNullable();
    table.date('data_vencimento').notNullable();
    
    // Status de pagamento
    table.enum('status', ['PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO'])
      .notNullable()
      .defaultTo('PENDENTE');
    
    // Dados do pagamento
    table.date('data_pagamento').nullable();
    table.decimal('valor_pago', 12, 2).nullable();
    table.string('forma_pagamento', 50).nullable(); // PIX, cartão, boleto, etc.
    table.string('comprovante_url', 500).nullable();
    
    table.text('observacoes').nullable();
    
    table.timestamps(true, true);
  });

  // Tabela de honorários (serviços prestados)
  await knex.schema.createTable('honorarios', (table) => {
    table.increments('id').primary();
    
    // Relacionamento com orçamento
    table.integer('orcamento_id').unsigned().notNullable();
    table.foreign('orcamento_id')
      .references('id')
      .inTable('orcamentos')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    // Descrição do serviço
    table.string('descricao', 200).notNullable();
    table.text('detalhes').nullable();
    
    // Valores
    table.decimal('valor', 12, 2).notNullable();
    table.integer('quantidade').notNullable().defaultTo(1);
    table.decimal('desconto', 12, 2).nullable();
    table.decimal('valor_final', 12, 2).notNullable();
    
    table.timestamps(true, true);
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_pagantes_orcamento ON pagantes(orcamento_id)');
  await knex.schema.raw('CREATE INDEX idx_parcelas_pagante ON parcelas(pagante_id)');
  await knex.schema.raw('CREATE INDEX idx_parcelas_status ON parcelas(status)');
  await knex.schema.raw('CREATE INDEX idx_parcelas_vencimento ON parcelas(data_vencimento)');
  await knex.schema.raw('CREATE INDEX idx_honorarios_orcamento ON honorarios(orcamento_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('honorarios');
  await knex.schema.dropTableIfExists('parcelas');
  await knex.schema.dropTableIfExists('pagantes');
}
