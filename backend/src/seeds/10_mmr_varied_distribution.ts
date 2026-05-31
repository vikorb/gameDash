import type { Knex } from 'knex';

type PlayerMmrRow = {
  id: number;
  user_id: number;
  mode_id: number;
  mmr: number;
};

export async function seed(knex: Knex): Promise<void> {
  const rows = (await knex('player_mmr')
    .select('id', 'user_id', 'mode_id', 'mmr')
    .orderBy('user_id', 'asc')
    .orderBy('mode_id', 'asc')
    .limit(2000)) as PlayerMmrRow[];

  if (rows.length === 0) return;

  for (const row of rows) {
    const spread = ((row.user_id * 37 + row.mode_id * 73) % 1700) - 700;
    const varied = Math.max(300, Math.min(2700, 1000 + spread));

    await knex('player_mmr')
      .where({ id: row.id })
      .update({ mmr: varied, updated_at: knex.fn.now() });
  }
}
