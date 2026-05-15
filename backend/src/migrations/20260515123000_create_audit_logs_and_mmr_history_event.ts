import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('audit_logs', (table) => {
    table.bigIncrements('id').primary();
    table.string('action', 64).notNullable();
    table.bigInteger('actor_user_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.jsonb('payload').notNullable().defaultTo('{}');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['action', 'created_at']);
  });

  await knex.schema.alterTable('mmr_history', (table) => {
    table.string('event_type', 64).nullable();
    table.jsonb('metadata').nullable();
    table.index(['mode_id', 'event_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('mmr_history', (table) => {
    table.dropIndex(['mode_id', 'event_type']);
    table.dropColumn('event_type');
    table.dropColumn('metadata');
  });

  await knex.schema.dropTableIfExists('audit_logs');
}
