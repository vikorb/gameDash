import db from '../database';
import { Player } from '../types/player';

/**
 * Retrieves a user combined with their mmr for a specific game mode,
 * to be used as a player object in the matchmaking queue.
 */
export async function getPlayerForQueue(userId: number | string, modeId: number): Promise<Player | null> {
  const row = await db('users')
    .leftJoin('player_mmr', function () {
      this.on('users.id', '=', 'player_mmr.user_id')
        .andOn('player_mmr.mode_id', '=', db.raw('?', [modeId]));
    })
    .where('users.id', userId)
    .select(
      'users.id',
      'users.pocketbase_user_id',
      'users.username',
      'users.region',
      'users.language',
      'users.matchmaking_pref',
      'player_mmr.mmr'
    )
    .first();

  if (!row) {
    return null;
  }

  // Handle parsing of JSON if the DB driver returns a string
  let prefs = row.matchmaking_pref;
  if (typeof prefs === 'string') {
    try {
      prefs = JSON.parse(prefs);
    } catch (e) {
      prefs = {};
    }
  }

  // TO UPDATE LATER WHEN WE HAVE A SYSTEM FOR IT
  const ranks = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
  const randomDivision = Math.floor(Math.random() * 4) + 1; // 1 to 4

  return new Player(
    row.id,
    row.pocketbase_user_id,
    row.username,
    row.region,
    row.language,
    prefs,
    row.mmr ?? 1000,
    randomRank,
    randomDivision,
    'online' // default status when fetched for queue
  );
}
