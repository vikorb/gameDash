import type { Knex } from 'knex';

type UserRow = { id: number };
type ModeRow = { id: number };
type PlayerMmrRow = { user_id: number; mmr: number };

export async function seed(knex: Knex): Promise<void> {
  await knex('match_participants').del();
  await knex.raw('UPDATE matches SET winner_team_id = NULL');
  await knex('match_teams').del();
  await knex('matches').del();

  const players = (await knex('users').where({ role: 'player' }).select('id').limit(60)) as UserRow[];
  const modes: ModeRow[] = await knex('game_modes').where({ is_active: true }).select('id');

  if (players.length < 8) {
    console.warn('Pas assez de joueurs pour seeder les matchs (minimum 8 requis)');
    return;
  }

  const allMmrRows: PlayerMmrRow[] = (await knex('player_mmr')
    .whereIn('user_id', players.map((p) => p.id))
    .select('user_id', 'mmr')) as PlayerMmrRow[];

  const mmrCache = new Map<string, number>();
  for (const row of allMmrRows) {
    for (const mode of modes) {
      mmrCache.set(`${row.user_id}_${mode.id}`, 1000);
    }
  }

  const now = new Date();

  for (const mode of modes) {
    for (let i = 0; i < 20; i++) {
      const playedAt = new Date(now.getTime() - (20 - i) * 24 * 60 * 60 * 1000);

      const shuffled = [...players].sort(() => Math.random() - 0.5).slice(0, 8);
      const teamAPlayers = shuffled.slice(0, 4);
      const teamBPlayers = shuffled.slice(4, 8);

      const winnerIndex = Math.random() < 0.5 ? 0 : 1;

      const [{ id: matchId }] = (await knex('matches').insert({
        game_mode_id: mode.id,
        status: 'completed',
        winner_team_id: null,
        played_at: playedAt.toISOString(),
      }).returning('id')) as { id: number }[];

      const [{ id: teamAId }] = (await knex('match_teams').insert({
        match_id: matchId,
        name: 'Équipe A',
        result: winnerIndex === 0 ? 'win' : 'loss',
      }).returning('id')) as { id: number }[];

      const [{ id: teamBId }] = (await knex('match_teams').insert({
        match_id: matchId,
        name: 'Équipe B',
        result: winnerIndex === 1 ? 'win' : 'loss',
      }).returning('id')) as { id: number }[];

      await knex('matches').where({ id: matchId }).update({
        winner_team_id: winnerIndex === 0 ? teamAId : teamBId,
      });

      type ParticipantInsert = {
        match_id: number;
        team_id: number;
        user_id: number;
        result: string;
        xp_gained: number;
        mmr_gained: number;
        nb_kills: number;
      };
      type HistoryInsert = { user_id: number; mode_id: number; mmr: number; date: string };

      const buildParticipantRows = (
        teamPlayers: UserRow[],
        teamId: number,
        isWinner: boolean,
      ): { participant: ParticipantInsert; history: HistoryInsert }[] =>
        teamPlayers.map((p) => {
          const cacheKey = `${p.id}_${mode.id}`;
          const mmrBefore = mmrCache.get(cacheKey) ?? 1000;
          const result = isWinner ? 'win' : 'loss';
          const mmrGained = result === 'win'
            ? Math.floor(Math.random() * 30) + 10
            : -(Math.floor(Math.random() * 20) + 5);
          const mmrAfter = Math.max(0, mmrBefore + mmrGained);
          const xpGained = result === 'win'
            ? Math.floor(Math.random() * 150) + 100
            : Math.floor(Math.random() * 50) + 10;
          const nbKills = result === 'win'
            ? Math.floor(Math.random() * 10) + 4
            : Math.floor(Math.random() * 7);

          mmrCache.set(cacheKey, mmrAfter);

          return {
            participant: {
              match_id: matchId,
              team_id: teamId,
              user_id: p.id,
              result,
              xp_gained: xpGained,
              mmr_gained: mmrGained,
              nb_kills: nbKills,
            },
            history: { user_id: p.id, mode_id: mode.id, mmr: mmrAfter, date: playedAt.toISOString() },
          };
        });

      const teamARows = buildParticipantRows(teamAPlayers, teamAId, winnerIndex === 0);
      const teamBRows = buildParticipantRows(teamBPlayers, teamBId, winnerIndex === 1);
      const allRows = [...teamARows, ...teamBRows];

      await knex('match_participants').insert(allRows.map((r) => r.participant));
      await knex('mmr_history').insert(allRows.map((r) => r.history));
    }

    for (const player of players) {
      const cacheKey = `${player.id}_${mode.id}`;
      const finalMmr = mmrCache.get(cacheKey);
      if (finalMmr !== undefined) {
        await knex('player_mmr')
          .where({ user_id: player.id, mode_id: mode.id })
          .update({ mmr: finalMmr });
      }
    }
  }
}
