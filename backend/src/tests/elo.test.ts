import { describe, it, expect } from 'vitest';
import db from '../database';
import { Player } from '../types/player';
import { saveFinishedMatch } from '../services/matchSaver';

describe('Elo calculation and persistence', () => {
  it('should update Elo and persist logs correctly', async () => {
    const p1 = new Player(1, 'pb_user_1', 'Player 1', 'EU', 'en', {}, 1000, 'Silver', 2, 'online');
    const p2 = new Player(2, 'pb_user_2', 'Player 2', 'EU', 'en', {}, 1000, 'Silver', 2, 'online');

    await db('users').insert({ id: 1, pocketbase_user_id: 'pb_user_1', username: 'p1', email: 'p1@test.com', role: 'player' }).onConflict('id').ignore();
    await db('users').insert({ id: 2, pocketbase_user_id: 'pb_user_2', username: 'p2', email: 'p2@test.com', role: 'player' }).onConflict('id').ignore();

    await db('player_mmr').insert({ user_id: 1, mode_id: 1, mmr: 1000 }).onConflict(['user_id', 'mode_id']).ignore();
    await db('player_mmr').insert({ user_id: 2, mode_id: 1, mmr: 1000 }).onConflict(['user_id', 'mode_id']).ignore();

    const result = await saveFinishedMatch({
      gameModeId: 1,
      winnerTeamName: 'Team A',
      teamAPlayers: [p1],
      teamBPlayers: [p2],
    });

    expect(result.matchId).toBeDefined();

    const mmrChangeWinner = (result.rewardsGranted as any)[1].mmrChange;
    const mmrChangeLoser = (result.rewardsGranted as any)[2].mmrChange;
    expect(mmrChangeWinner).toBeGreaterThan(0);
    expect(mmrChangeLoser).toBeLessThan(0);

    const history1 = await db('mmr_history').where({ user_id: 1, event_type: 'MMR_UPDATE' }).orderBy('id', 'desc').first();
    const history2 = await db('mmr_history').where({ user_id: 2, event_type: 'MMR_UPDATE' }).orderBy('id', 'desc').first();
    expect(history1).toBeDefined();
    expect(history2).toBeDefined();

    const auditLogs = await db('audit_logs').where({ action: 'MMR_UPDATE' }).orderBy('id', 'desc').limit(2);
    expect(auditLogs.length).toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(auditLogs[0].payload)).toContain('match_id');
  });
});
