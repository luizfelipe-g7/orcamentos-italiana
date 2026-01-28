import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('documentos', (table) => {
    table.increments('id').primary();
    
    // Relacionamento com membro
    table.integer('membro_id').unsigned().notNullable();
    table.foreign('membro_id')
      .references('id')
      .inTable('membros')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    // Tipo de documento
    table.string('tipo', 50).notNullable(); // certidao_nascimento, certidao_casamento, passaporte, etc.
    table.string('subtipo', 50).nullable(); // inteiro_teor, atualizada, etc.
    
    // Arquivo
    table.string('nome_arquivo', 255).notNullable();
    table.string('nome_original', 255).notNullable();
    table.string('url_s3', 500).notNullable();
    table.string('mime_type', 100).nullable();
    table.integer('tamanho_bytes').nullable();
    
    // Status do documento
    table.enum('status', ['PENDENTE', 'ENVIADO', 'EM_ANALISE', 'APROVADO', 'REJEITADO', 'VENCIDO'])
      .notNullable()
      .defaultTo('PENDENTE');
    
    // Datas importantes
    table.date('data_emissao').nullable();
    table.date('data_validade').nullable();
    
    // Assinatura digital (Autentique)
    table.string('autentique_id', 100).nullable();
    table.enum('status_assinatura', ['NAO_REQUER', 'PENDENTE', 'ENVIADO', 'ASSINADO', 'RECUSADO'])
      .nullable();
    table.timestamp('data_assinatura').nullable();
    
    table.text('observacoes').nullable();
    
    // Quem fez upload
    table.integer('uploaded_by').unsigned().nullable();
    table.foreign('uploaded_by')
      .references('id')
      .inTable('operadores')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');
    
    table.timestamps(true, true);
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_documentos_membro ON documentos(membro_id)');
  await knex.schema.raw('CREATE INDEX idx_documentos_tipo ON documentos(tipo)');
  await knex.schema.raw('CREATE INDEX idx_documentos_status ON documentos(status)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('documentos');
}
