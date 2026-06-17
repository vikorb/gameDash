import { Player } from '../types/player';
import { MatchmakingRoom } from '../types/MatchmakingRoom';
import { Server } from 'socket.io';

export function findCompatiblePlayers(queue: Player[], baseMMR: number, mmrWindow = 200): Player[] {
  return queue.filter(p => Math.abs(p.mmr - baseMMR) <= mmrWindow);
}

export function distributeToTeams(room: MatchmakingRoom, players: Player[]) {
  players.forEach(p => {
    if (room.teamA.length <= room.teamB.length && room.teamA.length < 4) {
      room.teamA.push(p);
    } else if (room.teamB.length < 4) {
      room.teamB.push(p);
    }
  });
}

export function broadcastRoomUpdate(room: MatchmakingRoom, io: Server) {
  io.to(room.id).emit('room_update', {
    roomId: room.id,
    teamA: room.teamA.map(p => ({ id: p.id, name: p.name, rank: p.rank, division: p.division, mmr: p.mmr, pocketbase_user_id: p.pocketbase_user_id, status: p.status, socketId: p.socketId })),
    teamB: room.teamB.map(p => ({ id: p.id, name: p.name, rank: p.rank, division: p.division, mmr: p.mmr, pocketbase_user_id: p.pocketbase_user_id, status: p.status, socketId: p.socketId })),
    status: room.status,
    readyStates: room.readyStates,
    readyCheckStartTime: room.readyCheckStartTime,
    votes: room.votes,
    voteMaps: room.voteMaps,
    voteStartTime: room.voteStartTime
  });
}
