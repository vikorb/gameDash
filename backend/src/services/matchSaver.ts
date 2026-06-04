import db from '../database';
import { Player } from '../types/player';

export async function saveFinishedMatch(params: {
  gameModeId: number;
  winnerTeamName: 'Team A' | 'Team B';
  teamAPlayers: Player[];
  teamBPlayers: Player[];
}) {
  const { gameModeId, winnerTeamName, teamAPlayers, teamBPlayers } = params;
  const rewards = await db('shop_economy_rewards').first() || { xp_win: 150, xp_loss: 50, soft_win: 100, soft_loss: 25 };

  return await db.transaction(async (trx) => {
    const [match] = await trx('matches').insert({ game_mode_id: gameModeId, status: 'completed', played_at: trx.fn.now() }).returning('*');
    const [teamA] = await trx('match_teams').insert({ match_id: match.id, name: 'Team A', result: winnerTeamName === 'Team A' ? 'win' : 'loss' }).returning('*');
    const [teamB] = await trx('match_teams').insert({ match_id: match.id, name: 'Team B', result: winnerTeamName === 'Team B' ? 'win' : 'loss' }).returning('*');
    await trx('matches').where({ id: match.id }).update({ winner_team_id: winnerTeamName === 'Team A' ? teamA.id : teamB.id });

    const rewardsGranted: Record<string | number, unknown> = {};

    const processPlayer = async (p: Player, isWinner: boolean, teamId: number) => {
      if (typeof p.id !== 'number') return;
      const xp = isWinner ? rewards.xp_win : rewards.xp_loss;
      const coins = isWinner ? rewards.soft_win : rewards.soft_loss;
      const mmrChange = isWinner ? 25 : -25;

      const mmrRow = await trx('player_mmr').where({ user_id: p.id, mode_id: gameModeId }).first();
      const currentMMR = mmrRow ? mmrRow.mmr : 1000;
      const nextMMR = Math.max(0, currentMMR + mmrChange);

      await trx('player_mmr').insert({ user_id: p.id, mode_id: gameModeId, mmr: nextMMR }).onConflict(['user_id', 'mode_id']).merge();
      await trx('mmr_history').insert({ user_id: p.id, mode_id: gameModeId, mmr: nextMMR });

      await trx('shop_wallet').insert({ user_id: p.id, soft: coins, hard: 0 }).onConflict('user_id').merge({ soft: trx.raw('shop_wallet.soft + ?', [coins]) });
      await trx('shop_transactions').insert({ user_id: p.id, type: 'reward', currency: 'soft', amount: coins, ref_name: `Match Reward #${match.id}` });

      let rewardedItem: unknown = null;
      if (isWinner && Math.random() < 0.5) {
        const ownedItems = await trx('shop_inventory').where({ user_id: p.id }).pluck('item_id');
        const availableItem = await trx('shop_items').where({ is_active: true }).whereNotIn('id', ownedItems || []).first();
        if (availableItem) {
          await trx('shop_inventory').insert({ user_id: p.id, item_id: availableItem.id });
          rewardedItem = availableItem;
        }
      }

      await trx('match_participants').insert({ match_id: match.id, team_id: teamId, user_id: p.id, result: isWinner ? 'win' : 'loss', xp_gained: xp, mmr_gained: mmrChange, nb_kills: Math.floor(Math.random() * 10) });
      rewardsGranted[p.id] = { xp, coins, mmrChange, nextMMR, rewardedItem };
    };

    for (const p of teamAPlayers) await processPlayer(p, winnerTeamName === 'Team A', teamA.id);
    for (const p of teamBPlayers) await processPlayer(p, winnerTeamName === 'Team B', teamB.id);

    return { matchId: match.id, rewardsGranted };
  });
}
