import type { Knex } from 'knex';


export async function seed(knex: Knex): Promise<void> {
  await knex('rank_divisions').del();
  await knex('ranks').del();

  const ranks = [
    { id: 1, name: 'Bronze', min_xp: 0, max_xp: 999 },
    { id: 2, name: 'Silver', min_xp: 1000, max_xp: 1999 },
    { id: 3, name: 'Gold', min_xp: 2000, max_xp: 2999 },
    { id: 4, name: 'Platinum', min_xp: 3000, max_xp: 3999 },
    { id: 5, name: 'Diamond', min_xp: 4000, max_xp: 4999 },
    { id: 6, name: 'Master', min_xp: 5000, max_xp: 5999 },
    { id: 7, name: 'Grandmaster', min_xp: 6000, max_xp: 999999 },
  ];
  await knex('ranks').insert(ranks);

  const divisions = [];
  let divisionId = 1;
  for (const rank of ranks) {
    if (rank.name === 'Grandmaster') {
      divisions.push({
        id: divisionId++,
        // rank_id supprimé
        name: 'Unique',
        min_xp: rank.min_xp,
        max_xp: rank.max_xp,
        order: 1,
      });
      continue;
    }
    const step = Math.floor((rank.max_xp - rank.min_xp + 1) / 3);
    for (let i = 0; i < 3; i++) {
      const min_xp = rank.min_xp + i * step;
      const max_xp = i === 2 ? rank.max_xp : min_xp + step - 1;
      divisions.push({
        id: divisionId++,
        // rank_id supprimé
        name: `Division ${3 - i}`,
        min_xp,
        max_xp,
        order: 3 - i,
      });
    }
  }
  await knex('rank_divisions').insert(divisions);
}
