import db from '../database';
import { badRequest } from '../utils/httpError';

export async function getMatchHistory(params: {
  userId: number; modeId?: number; result?: string;
  dateFrom?: string; dateTo?: string; limit: number; offset: number;
}) {
  const { userId, modeId, result, dateFrom, dateTo, limit, offset } = params;
  if (isNaN(userId)) throw badRequest('userId invalide', 'VALIDATION_ERROR');

  const query = db('match_participants as mp')
    .join('matches as m', 'm.id', 'mp.match_id')
    .join('match_teams as mt', 'mt.id', 'mp.team_id')
    .join('game_modes as gm', 'gm.id', 'm.game_mode_id')
    .leftJoin('maps as map', 'map.id', 'm.map_id')
    .where('mp.user_id', userId)
    .select(
      'm.id as match_id', 'm.played_at', 'm.status',
      'gm.id as game_mode_id', 'gm.name as game_mode_name',
      'mt.id as team_id', 'mt.name as team_name',
      'mp.result', 'mp.xp_gained', 'mp.mmr_gained', 'mp.nb_kills',
      'map.id as map_id', 'map.title as map_title',
      db.raw(`(SELECT mh.mmr FROM mmr_history mh WHERE mh.user_id = mp.user_id AND mh.mode_id = m.game_mode_id ORDER BY ABS(EXTRACT(EPOCH FROM (mh.date - m.played_at))) LIMIT 1) as mmr_after`)
    )
    .orderBy('m.played_at', 'desc').limit(limit).offset(offset);

  if (modeId) query.where('m.game_mode_id', modeId);
  if (result) query.where('mp.result', result);
  if (dateFrom) query.whereRaw('DATE(m.played_at) >= ?', [dateFrom]);
  if (dateTo) query.whereRaw('DATE(m.played_at) <= ?', [dateTo]);

  const rows = await query as any[];
  const matchIds = [...new Set(rows.map(r => r.match_id))];

  const participants = matchIds.length
    ? await db('match_participants as mp')
        .join('users as u', 'u.id', 'mp.user_id')
        .join('match_teams as mt', 'mt.id', 'mp.team_id')
        .whereIn('mp.match_id', matchIds)
        .select('mp.match_id', 'mp.team_id', 'mt.name as team_name', 'mp.result', 'u.id as user_id', 'u.username')
    : [];

  const participantsByMatch: Record<number, any[]> = {};
  for (const p of participants) {
    (participantsByMatch[p.match_id] ||= []).push(p);
  }

  const matches = rows.map(row => {
    const parts = participantsByMatch[row.match_id] ?? [];
    const teams: Record<number, any> = {};
    for (const p of parts) {
      const t = teams[p.team_id] ||= { id: p.team_id, name: p.team_name, result: p.result, players: [] };
      t.players.push({ id: p.user_id, username: p.username });
    }
    return {
      match_id: row.match_id, played_at: row.played_at, status: row.status,
      game_mode: { id: row.game_mode_id, name: row.game_mode_name },
      map: row.map_id ? { id: row.map_id, name: row.map_title } : null,
      my_team: { id: row.team_id, name: row.team_name },
      result: row.result, xp_gained: row.xp_gained, mmr_gained: row.mmr_gained, nb_kills: row.nb_kills,
      mmr_after: row.mmr_after ?? null,
      mmr_before: row.mmr_after != null ? row.mmr_after - row.mmr_gained : null,
      teams: Object.values(teams),
    };
  });

  const totalQ = db('match_participants as mp')
    .join('matches as m', 'm.id', 'mp.match_id')
    .where('mp.user_id', userId);
  if (modeId) totalQ.where('m.game_mode_id', modeId);
  if (result) totalQ.where('mp.result', result);
  if (dateFrom) totalQ.whereRaw('DATE(m.played_at) >= ?', [dateFrom]);
  if (dateTo) totalQ.whereRaw('DATE(m.played_at) <= ?', [dateTo]);
  const total = await totalQ.count('mp.id as count').first() as any;

  return { matches, total: Number(total?.count ?? 0), limit, offset };
}
