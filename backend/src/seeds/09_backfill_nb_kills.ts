import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`
    UPDATE match_participants
    SET nb_kills = CASE
      WHEN result = 'win' THEN FLOOR(random() * 10 + 4)::int
      WHEN result = 'loss' THEN FLOOR(random() * 7)::int
      WHEN result = 'draw' THEN FLOOR(random() * 5)::int
      ELSE 0
    END
    WHERE nb_kills = 0
  `);
}
