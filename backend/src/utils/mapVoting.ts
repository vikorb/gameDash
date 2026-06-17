import { Server } from 'socket.io';
import db from '../database';
import { MatchmakingRoom } from '../types/MatchmakingRoom';
import { broadcastRoomUpdate } from './roomMatcher';
import { launchGame } from './gameSimulator';

export async function startMapVoting(room: MatchmakingRoom, io: Server, rooms: MatchmakingRoom[]) {
  if (room.readyTimeout) { clearTimeout(room.readyTimeout); room.readyTimeout = null; }
  room.status = 'map_voting';
  room.voteStartTime = Date.now();
  room.votes = {};

  try {
    const allMaps = await db('maps').whereNull('deleted_at').select('id', 'title');
    room.voteMaps = allMaps.sort(() => 0.5 - Math.random()).slice(0, 3).map((m: any) => ({
      id: Number(m.id),
      title: m.title
    }));
  } catch (err) {
    console.error('[mapVoting] failed to fetch maps:', err);
    room.voteMaps = [{ id: 1, title: 'Map Alpha' }, { id: 2, title: 'Map Beta' }, { id: 3, title: 'Map Gamma' }];
  }

  broadcastRoomUpdate(room, io);
  room.voteTimeout = setTimeout(() => resolveMapVoting(room, io, rooms), 15000);

  room.getAllPlayers().forEach(p => {
    if (p.id.toString().startsWith('bot_')) {
      const delay = 3000 + Math.random() * 5000;
      const botT = setTimeout(() => {
        if (room.status !== 'map_voting') return;
        const choices = [...room.voteMaps.map(m => m.id), null];
        room.votes[p.id] = choices[Math.floor(Math.random() * choices.length)];
        broadcastRoomUpdate(room, io);
        const allVoted = room.getAllPlayers().every(player => room.votes[player.id] !== undefined);
        if (allVoted) resolveMapVoting(room, io, rooms);
      }, delay);
      room.botVoteTimeouts.push(botT);
    }
  });
}

export function resolveMapVoting(room: MatchmakingRoom, io: Server, rooms: MatchmakingRoom[]) {
  if (room.status !== 'map_voting') return;
  if (room.voteTimeout) { clearTimeout(room.voteTimeout); room.voteTimeout = null; }
  room.botVoteTimeouts.forEach(t => clearTimeout(t));
  room.botVoteTimeouts = [];

  const counts: Record<number, number> = {};
  room.voteMaps.forEach(m => { counts[Number(m.id)] = 0; });
  let validVotes = 0;
  Object.values(room.votes).forEach(v => {
    if (v !== null && v !== undefined) {
      const mapIdNum = Number(v);
      counts[mapIdNum] = (counts[mapIdNum] || 0) + 1;
      validVotes++;
    }
  });

  let chosen = room.voteMaps[Math.floor(Math.random() * room.voteMaps.length)];
  if (validVotes > 0) {
    let max = -1;
    let favs: typeof room.voteMaps = [];
    room.voteMaps.forEach(m => {
      const v = counts[Number(m.id)] || 0;
      if (v > max) { max = v; favs = [m]; }
      else if (v === max) { favs.push(m); }
    });
    if (favs.length > 0) chosen = favs[Math.floor(Math.random() * favs.length)];
  }

  room.selectedMap = chosen;
  launchGame(room, io, rooms);
}
