import { Knex } from 'knex';

import { saveFinishedMatch } from '../services/matchSaver';
import { Player } from '../types/player';

export async function seed(knex: Knex): Promise<void> {
  const users = await knex('users').where({ role: 'player' }).select('id', 'username', 'pocketbase_user_id');
  const modes = await knex('game_modes').select('id');
  if (users.length < 8) return;

  const toPlayer = (u: any, mmr: number) => new Player(u.id, u.pocketbase_user_id, u.username, 'EU', 'en', {}, mmr, 'Silver', 2, 'online');

  for (const mode of modes) {
    const modeId = Number(mode.id);
    const mmrRows = await knex('player_mmr').where({ mode_id: modeId });
    const mmrMap = new Map(mmrRows.map(r => [Number(r.user_id), Number(r.mmr)]));
    const getMMR = (id: number) => mmrMap.get(id) ?? 1000;

    for (let m = 0; m < 200; m++) {
      const shuffled = [...users].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 8);
      const teamA = selected.slice(0, 4).map(u => toPlayer(u, getMMR(u.id)));
      const teamB = selected.slice(4, 8).map(u => toPlayer(u, getMMR(u.id)));

      const winner = Math.random() < 0.5 ? 'Team A' : 'Team B';
      const result = await saveFinishedMatch({ gameModeId: modeId, winnerTeamName: winner, teamAPlayers: teamA, teamBPlayers: teamB });

      Object.entries(result.rewardsGranted).forEach(([idStr, val]: [string, any]) => {
        mmrMap.set(Number(idStr), val.nextMMR);
      });
    }

    const smurfUser = users.find(u => u.id === 10) || users[0];
    for (let s = 0; s < 10; s++) {
      const others = users.filter(u => u.id !== smurfUser.id).sort(() => 0.5 - Math.random()).slice(0, 7);
      const teamA = [smurfUser, ...others.slice(0, 3)].map(u => toPlayer(u, getMMR(u.id)));
      const teamB = others.slice(3, 7).map(u => toPlayer(u, getMMR(u.id)));
      const result = await saveFinishedMatch({ gameModeId: modeId, winnerTeamName: 'Team A', teamAPlayers: teamA, teamBPlayers: teamB });
      Object.entries(result.rewardsGranted).forEach(([idStr, val]: [string, any]) => mmrMap.set(Number(idStr), val.nextMMR));
    }
  }
}
