import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('operadores', (table) => {
    table.increments('id').primary();
    table.string('nome', 100).notNullable();
    table.string('email', 150).notNullable().unique();
    table.string('senha', 255).notNullable();
    table.enum('role', ['ADM', 'VENDEDOR']).notNullable().defaultTo('VENDEDOR');
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamps(true, true); // created_at e updated_at
  });

  // Índices
  await knex.schema.raw('CREATE INDEX idx_operadores_email ON operadores(email)');
  await knex.schema.raw('CREATE INDEX idx_operadores_ativo ON operadores(ativo)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('operadores');
}
