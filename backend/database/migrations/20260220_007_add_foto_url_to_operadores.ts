import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('operadores', 'foto_url');
  if (!hasColumn) {
    await knex.schema.alterTable('operadores', (table) => {
      table.string('foto_url', 500).nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('operadores', 'foto_url');
  if (hasColumn) {
    await knex.schema.alterTable('operadores', (table) => {
      table.dropColumn('foto_url');
    });
  }
}
