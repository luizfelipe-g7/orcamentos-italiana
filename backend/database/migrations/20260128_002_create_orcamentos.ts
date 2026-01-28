import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orcamentos', (table) => {
    table.increments('id').primary();
    table.string('nome_familia', 150).notNullable();
    table.enum('cidadania', ['IT', 'PT']).notNullable();
    table.enum('status', ['ABERTO', 'FECHADO', 'CANCELADO', 'EM_ANDAMENTO'])
      .notNullable()
      .defaultTo('ABERTO');
    
    // Valores financeiros
    table.decimal('valor_total', 12, 2).nullable();
    table.integer('num_parcelas').nullable();
    table.decimal('valor_entrada', 12, 2).nullable();
    table.decimal('valor_parcela', 12, 2).nullable();
    
    // Datas importantes
    table.date('data_fechamento').nullable();
    table.date('previsao_inicio').nullable();
    
    // Observações
    table.text('observacoes').nullable();
    
    // Relacionamento com operador
    table.integer('operador_id').unsigned().notNullable();
    table.foreign('operador_id')
      .references('id')
      .inTable('operadores')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    
    // Integração Bitrix
    table.string('bitrix_deal_id', 50).nullable();
    
    table.timestamps(true, true);
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_orcamentos_operador ON orcamentos(operador_id)');
  await knex.schema.raw('CREATE INDEX idx_orcamentos_status ON orcamentos(status)');
  await knex.schema.raw('CREATE INDEX idx_orcamentos_cidadania ON orcamentos(cidadania)');
  await knex.schema.raw('CREATE INDEX idx_orcamentos_created ON orcamentos(created_at DESC)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('orcamentos');
}
