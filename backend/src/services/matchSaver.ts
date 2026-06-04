import db from '../database';
import { Player } from '../types/player';

export async function saveFinishedMatch(params: {
  gameModeId: number; winnerTeamName: 'Team A' | 'Team B';
  teamAPlayers: Player[]; teamBPlayers: Player[];
}) {
  const { gameModeId, winnerTeamName, teamAPlayers, teamBPlayers } = params;
  const rewards = await db('shop_economy_rewards').first() || { xp_win: 150, xp_loss: 50, soft_win: 100, soft_loss: 25 };

  return await db.transaction(async (trx) => {
    const [match] = await trx('matches').insert({ game_mode_id: gameModeId, status: 'completed' }).returning('*');
    const [teamA] = await trx('match_teams').insert({ match_id: match.id, name: 'Team A', result: winnerTeamName === 'Team A' ? 'win' : 'loss' }).returning('*');
    const [teamB] = await trx('match_teams').insert({ match_id: match.id, name: 'Team B', result: winnerTeamName === 'Team B' ? 'win' : 'loss' }).returning('*');
    await trx('matches').where({ id: match.id }).update({ winner_team_id: winnerTeamName === 'Team A' ? teamA.id : teamB.id });

    const playerIds = [...teamAPlayers, ...teamBPlayers].map(p => p.id).filter(id => !isNaN(Number(id)));
    const mmrRows = await trx('player_mmr').whereIn('user_id', playerIds).andWhere({ mode_id: gameModeId });
    const mmrMap = new Map(mmrRows.map(r => [Number(r.user_id), Number(r.mmr)]));

    const getMMR = (p: Player) => mmrMap.get(Number(p.id)) ?? 1000;
    const avgA = teamAPlayers.reduce((sum, p) => sum + getMMR(p), 0) / (teamAPlayers.length || 1);
    const avgB = teamBPlayers.reduce((sum, p) => sum + getMMR(p), 0) / (teamBPlayers.length || 1);

    const rewardsGranted: Record<string | number, unknown> = {};

    const processPlayer = async (p: Player, isWinner: boolean, teamId: number, isTeamA: boolean) => {
      const pId = Number(p.id);
      if (isNaN(pId)) return;
      const xp = isWinner ? rewards.xp_win : rewards.xp_loss;
      const coins = isWinner ? rewards.soft_win : rewards.soft_loss;

      const currentMMR = getMMR(p);
      const oppAvg = isTeamA ? avgB : avgA;
      const P = 1 / (1 + Math.pow(10, (oppAvg - currentMMR) / 400));
      const K = currentMMR < 1200 ? 32 : currentMMR < 1800 ? 24 : 12;
      const mmrChange = Math.round(K * ((isWinner ? 1 : 0) - P));
      const nextMMR = Math.max(0, currentMMR + mmrChange);

      await trx('player_mmr').insert({ user_id: pId, mode_id: gameModeId, mmr: nextMMR }).onConflict(['user_id', 'mode_id']).merge();
      await trx('mmr_history').insert({ user_id: pId, mode_id: gameModeId, mmr: nextMMR, event_type: 'MMR_UPDATE', metadata: JSON.stringify({ match_id: match.id, delta: mmrChange }) });
      await trx('audit_logs').insert({ action: 'MMR_UPDATE', actor_user_id: pId, payload: JSON.stringify({ match_id: match.id, user_id: pId, mmr_before: currentMMR, mmr_after: nextMMR, mmr_delta: mmrChange }) });

      await trx('shop_wallet').insert({ user_id: pId, soft: coins, hard: 0 }).onConflict('user_id').merge({ soft: trx.raw('shop_wallet.soft + ?', [coins]) });
      await trx('shop_transactions').insert({ user_id: pId, type: 'reward', currency: 'soft', amount: coins, ref_name: `Match Reward #${match.id}` });

      let rewardedItem: unknown = null;
      if (isWinner && Math.random() < 0.5) {
        const owned = await trx('shop_inventory').where({ user_id: pId }).pluck('item_id');
        const item = await trx('shop_items').where({ is_active: true }).whereNotIn('id', owned || []).first();
        if (item) {
          await trx('shop_inventory').insert({ user_id: pId, item_id: item.id });
          rewardedItem = item;
        }
      }

      await trx('match_participants').insert({ match_id: match.id, team_id: teamId, user_id: pId, result: isWinner ? 'win' : 'loss', xp_gained: xp, mmr_gained: mmrChange, mmr_before: currentMMR, mmr_after: nextMMR, mmr_delta: mmrChange, nb_kills: Math.floor(Math.random() * 10) });
      rewardsGranted[pId] = { xp, coins, mmrChange, nextMMR, rewardedItem };
    };

    for (const p of teamAPlayers) await processPlayer(p, winnerTeamName === 'Team A', teamA.id, true);
    for (const p of teamBPlayers) await processPlayer(p, winnerTeamName === 'Team B', teamB.id, false);

    return { matchId: match.id, rewardsGranted };
  });
}
