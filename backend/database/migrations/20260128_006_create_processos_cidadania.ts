import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Tabela de processos de cidadania (acompanhamento)
  await knex.schema.createTable('processos_cidadania', (table) => {
    table.increments('id').primary();
    
    // Relacionamento com orçamento
    table.integer('orcamento_id').unsigned().notNullable().unique();
    table.foreign('orcamento_id')
      .references('id')
      .inTable('orcamentos')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    // Tipo de processo
    table.enum('tipo', ['JUDICIAL', 'ADMINISTRATIVO', 'CONSULADO']).notNullable();
    
    // Status do processo
    table.enum('status', [
      'AGUARDANDO_DOCUMENTOS',
      'DOCUMENTOS_EM_ANALISE',
      'AGUARDANDO_TRADUCAO',
      'AGUARDANDO_APOSTILAMENTO',
      'PRONTO_PARA_PROTOCOLO',
      'PROTOCOLADO',
      'EM_ANALISE_CONSULADO',
      'EM_ANALISE_TRIBUNAL',
      'AGUARDANDO_SENTENCA',
      'SENTENCA_FAVORAVEL',
      'SENTENCA_DESFAVORAVEL',
      'CIDADANIA_RECONHECIDA',
      'CONCLUIDO',
      'CANCELADO'
    ]).notNullable().defaultTo('AGUARDANDO_DOCUMENTOS');
    
    // Datas importantes
    table.date('data_inicio').nullable();
    table.date('data_protocolo').nullable();
    table.date('data_previsao_conclusao').nullable();
    table.date('data_conclusao').nullable();
    
    // Dados do processo judicial (se aplicável)
    table.string('numero_processo', 50).nullable();
    table.string('tribunal', 100).nullable();
    table.string('comarca', 100).nullable();
    table.string('juiz', 150).nullable();
    
    // Dados do consulado (se aplicável)
    table.string('consulado', 100).nullable();
    table.string('numero_pratica', 50).nullable();
    
    // Advogado/Despachante responsável
    table.string('responsavel', 150).nullable();
    table.string('contato_responsavel', 100).nullable();
    
    table.text('observacoes').nullable();
    
    table.timestamps(true, true);
  });

  // Tabela de histórico/timeline do processo
  await knex.schema.createTable('processo_historico', (table) => {
    table.increments('id').primary();
    
    // Relacionamento com processo
    table.integer('processo_id').unsigned().notNullable();
    table.foreign('processo_id')
      .references('id')
      .inTable('processos_cidadania')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    // Evento
    table.string('titulo', 150).notNullable();
    table.text('descricao').nullable();
    table.string('status_anterior', 50).nullable();
    table.string('status_novo', 50).nullable();
    
    // Quem registrou
    table.integer('operador_id').unsigned().nullable();
    table.foreign('operador_id')
      .references('id')
      .inTable('operadores')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');
    
    table.timestamp('data_evento').notNullable().defaultTo(knex.fn.now());
    
    table.timestamps(true, true);
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_processos_orcamento ON processos_cidadania(orcamento_id)');
  await knex.schema.raw('CREATE INDEX idx_processos_status ON processos_cidadania(status)');
  await knex.schema.raw('CREATE INDEX idx_processos_tipo ON processos_cidadania(tipo)');
  await knex.schema.raw('CREATE INDEX idx_historico_processo ON processo_historico(processo_id)');
  await knex.schema.raw('CREATE INDEX idx_historico_data ON processo_historico(data_evento DESC)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('processo_historico');
  await knex.schema.dropTableIfExists('processos_cidadania');
}
