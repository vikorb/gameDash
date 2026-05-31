import type { Knex } from 'knex';


export async function seed(knex: Knex): Promise<void> {
  await knex('user_ranks').del();

  const users: { id: number }[] = await knex('users').select('id');
  const gameModes: { id: number }[] = await knex('game_modes').select('id');
  const now = new Date().toISOString();
  const userRanks = [];
  for (const user of users) {
    for (const mode of gameModes) {
      userRanks.push({
        user_id: user.id,
        game_modes_id: mode.id,
        xp: Math.floor(Math.random() * 10000),
        created_at: now,
        updated_at: now,
      });
    }
  }
  if (userRanks.length > 0) {
    await knex('user_ranks').insert(userRanks);
  }
}
