import type { Knex } from 'knex';

type UserRow = { id: number; email: string; role: string };
type ModeRow = { id: number };
type MapRow = { id: number };

type ParticipantInsert = {
  match_id: number;
  team_id: number;
  user_id: number;
  result: 'win' | 'loss';
  xp_gained: number;
  mmr_gained: number;
  nb_kills: number;
};

const TARGET_EMAIL = 'test@test.com';
const PLAYERS_PER_MATCH = 8;

function todayDateUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildPlayedAt(dayDate: string, hourUTC: number): string {
  return new Date(`${dayDate}T${String(hourUTC).padStart(2, '0')}:00:00.000Z`).toISOString();
}

export async function seed(knex: Knex): Promise<void> {
  const dayDate = todayDateUTC();

  const targetUser = await knex<UserRow>('users')
    .where({ email: TARGET_EMAIL })
    .first('id', 'email', 'role');

  if (!targetUser) {
    console.warn(`[seed:today_missions_matches] Target user not found: ${TARGET_EMAIL}`);
    return;
  }

  const activeMode = await knex<ModeRow>('game_modes')
    .where('is_active', true)
    .orderBy('id', 'asc')
    .first('id');

  if (!activeMode) {
    console.warn('[seed:today_missions_matches] No active game mode found.');
    return;
  }

  const maps = await knex<MapRow>('maps').select('id').orderBy('id', 'asc');

  const existingTodayCountRow = await knex('match_participants as mp')
    .join('matches as m', 'm.id', 'mp.match_id')
    .where('mp.user_id', targetUser.id)
    .whereRaw('DATE(m.played_at) = ?', [dayDate])
    .count<{ count: string }[]>({ count: 'mp.id' })
    .first();

  const existingTodayCount = Number(existingTodayCountRow?.count ?? 0);
  const neededMatches = Math.max(0, 3 - existingTodayCount);

  if (neededMatches === 0) {
    console.log(`[seed:today_missions_matches] ${TARGET_EMAIL} already has at least 3 matches today.`);
    return;
  }

  const fillerPlayers = await knex<UserRow>('users')
    .where({ role: 'player' })
    .whereNot({ id: targetUser.id })
    .orderBy('id', 'asc')
    .limit(PLAYERS_PER_MATCH - 1)
    .select('id', 'email', 'role');

  if (fillerPlayers.length < PLAYERS_PER_MATCH - 1) {
    console.warn('[seed:today_missions_matches] Not enough player accounts to seed 8-player matches.');
    return;
  }

  const participantPool = [targetUser, ...fillerPlayers];
  const targetKillsByMatch = [8, 7, 6];

  for (let index = 0; index < neededMatches; index += 1) {
    const playedAt = buildPlayedAt(dayDate, 10 + index * 2);
    const mapId = maps.length > 0 ? maps[index % maps.length]?.id ?? null : null;

    const orderedPlayers: UserRow[] = [];
    for (let i = 0; i < participantPool.length; i += 1) {
      orderedPlayers.push(participantPool[(i + index) % participantPool.length]);
    }
    const teamAPlayers = orderedPlayers.slice(0, PLAYERS_PER_MATCH / 2);
    const teamBPlayers = orderedPlayers.slice(PLAYERS_PER_MATCH / 2);

    const targetInTeamA = teamAPlayers.some((player) => player.id === targetUser.id);

    const [{ id: matchId }] = (await knex('matches')
      .insert({
        game_mode_id: activeMode.id,
        map_id: mapId,
        status: 'completed',
        winner_team_id: null,
        played_at: playedAt,
      })
      .returning('id')) as { id: number }[];

    const [{ id: teamAId }] = (await knex('match_teams')
      .insert({
        match_id: matchId,
        name: 'Team A',
        result: targetInTeamA ? 'win' : 'loss',
      })
      .returning('id')) as { id: number }[];

    const [{ id: teamBId }] = (await knex('match_teams')
      .insert({
        match_id: matchId,
        name: 'Team B',
        result: targetInTeamA ? 'loss' : 'win',
      })
      .returning('id')) as { id: number }[];

    await knex('matches').where({ id: matchId }).update({
      winner_team_id: targetInTeamA ? teamAId : teamBId,
    });

    const participants: ParticipantInsert[] = [];

    for (const player of teamAPlayers) {
      const isTarget = player.id === targetUser.id;
      const targetKills = targetKillsByMatch[index] ?? 6;
      participants.push({
        match_id: matchId,
        team_id: teamAId,
        user_id: player.id,
        result: targetInTeamA ? 'win' : 'loss',
        xp_gained: targetInTeamA ? (isTarget ? 220 : 160) : 40,
        mmr_gained: targetInTeamA ? 18 : -10,
        nb_kills: isTarget ? targetKills : targetInTeamA ? 4 : 2,
      });
    }

    for (const player of teamBPlayers) {
      const isTarget = player.id === targetUser.id;
      const targetKills = targetKillsByMatch[index] ?? 6;
      participants.push({
        match_id: matchId,
        team_id: teamBId,
        user_id: player.id,
        result: targetInTeamA ? 'loss' : 'win',
        xp_gained: targetInTeamA ? 40 : isTarget ? 220 : 160,
        mmr_gained: targetInTeamA ? -10 : 18,
        nb_kills: isTarget ? targetKills : targetInTeamA ? 2 : 4,
      });
    }

    await knex('match_participants').insert(participants);
  }

  console.log(
    `[seed:today_missions_matches] Inserted ${neededMatches} match(es) for ${TARGET_EMAIL} on ${dayDate}.`,
  );
}
