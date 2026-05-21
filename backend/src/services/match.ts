import db from '@/database';
import { badRequest } from '@/utils/httpError';

export type MatchRow = {
  match_id: number;
  played_at: string;
  status: string;
  game_mode_id: number;
  game_mode_name: string;
  team_id: number;
  team_name: string;
  result: string;
  xp_gained: number;
  mmr_gained: number;
  nb_kills: number;
  mmr_after: number | null;
};

export type ParticipantRow = {
  match_id: number;
  team_id: number;
  team_name: string;
  result: string;
  user_id: number;
  username: string;
};

export type MatchHistoryParams = {
  userId: number;
  modeId?: number;
  result?: string;
  dateFrom?: string;
  dateTo?: string;
  limit: number;
  offset: number;
};

export async function getMatchHistory({ userId, modeId, result, dateFrom, dateTo, limit, offset }: MatchHistoryParams) {
  if (isNaN(userId)) throw badRequest('userId invalide', 'VALIDATION_ERROR');

  const query = db('match_participants as mp')
    .join('matches as m', 'm.id', 'mp.match_id')
    .join('match_teams as mt', 'mt.id', 'mp.team_id')
    .join('game_modes as gm', 'gm.id', 'm.game_mode_id')
    .where('mp.user_id', userId)
    .select(
      'm.id as match_id',
      'm.played_at',
      'm.status',
      'gm.id as game_mode_id',
      'gm.name as game_mode_name',
      'mt.id as team_id',
      'mt.name as team_name',
      'mp.result',
      'mp.xp_gained',
      'mp.mmr_gained',
      'mp.nb_kills',
      db.raw(`(
        SELECT mh.mmr FROM mmr_history mh
        WHERE mh.user_id = mp.user_id
          AND mh.mode_id = m.game_mode_id
        ORDER BY ABS(EXTRACT(EPOCH FROM (mh.date - m.played_at)))
        LIMIT 1
      ) as mmr_after`),
    )
    .orderBy('m.played_at', 'desc')
    .limit(limit)
    .offset(offset);

  if (modeId) query.where('m.game_mode_id', modeId);
  if (result) query.where('mp.result', result);
  if (dateFrom) query.whereRaw('DATE(m.played_at) >= ?', [dateFrom]);
  if (dateTo) query.whereRaw('DATE(m.played_at) <= ?', [dateTo]);

  const rows = await query as MatchRow[];

  const matchIds = [...new Set(rows.map((r) => r.match_id))];

  const participants: ParticipantRow[] = matchIds.length
    ? await db('match_participants as mp')
        .join('users as u', 'u.id', 'mp.user_id')
        .join('match_teams as mt', 'mt.id', 'mp.team_id')
        .whereIn('mp.match_id', matchIds)
        .select<ParticipantRow[]>(
          'mp.match_id',
          'mp.team_id',
          'mt.name as team_name',
          'mp.result',
          'u.id as user_id',
          'u.username',
        )
    : [];

  const participantsByMatch: Record<number, ParticipantRow[]> = {};
  for (const p of participants) {
    if (!participantsByMatch[p.match_id]) participantsByMatch[p.match_id] = [];
    participantsByMatch[p.match_id].push(p);
  }

  const matches = rows.map((row) => {
    const allParticipants = participantsByMatch[row.match_id] ?? [];
    const teams: Record<number, { id: number; name: string; result: string; players: { id: number; username: string }[] }> = {};
    for (const p of allParticipants) {
      if (!teams[p.team_id]) {
        teams[p.team_id] = { id: p.team_id, name: p.team_name, result: p.result, players: [] };
      }
      teams[p.team_id].players.push({ id: p.user_id, username: p.username });
    }

    return {
      match_id: row.match_id,
      played_at: row.played_at,
      status: row.status,
      game_mode: { id: row.game_mode_id, name: row.game_mode_name },
      my_team: { id: row.team_id, name: row.team_name },
      result: row.result,
      xp_gained: row.xp_gained,
      mmr_gained: row.mmr_gained,
      nb_kills: row.nb_kills,
      mmr_after: row.mmr_after ?? null,
      mmr_before: row.mmr_after != null ? row.mmr_after - row.mmr_gained : null,
      teams: Object.values(teams),
    };
  });

  const total = await db('match_participants as mp')
    .join('matches as m', 'm.id', 'mp.match_id')
    .where('mp.user_id', userId)
    .modify((q) => {
      if (modeId) q.where('m.game_mode_id', modeId);
      if (result) q.where('mp.result', result);
      if (dateFrom) q.whereRaw('DATE(m.played_at) >= ?', [dateFrom]);
      if (dateTo) q.whereRaw('DATE(m.played_at) <= ?', [dateTo]);
    })
    .count('mp.id as count')
    .first<{ count: string }>();

  return { matches, total: Number(total?.count ?? 0), limit, offset };
}
