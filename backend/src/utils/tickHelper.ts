import { Server } from 'socket.io';
import { MatchmakingRoom } from '../types/MatchmakingRoom';
import { Player } from '../types/player';
import { isDemoModeActive } from './demoMode';
import { startMapVoting } from './mapVoting';
import { broadcastRoomUpdate, distributeToTeams, findCompatiblePlayers } from './roomMatcher';

interface IManager {
  players: Player[];
  rooms: MatchmakingRoom[];
}

function emitMatchFound(room: MatchmakingRoom, io: Server) {
  io.to(room.id).emit('match_found', {
    roomId: room.id,
    game: {
      teams: [
        room.teamA.map(p => ({ id: p.id, pocketbase_user_id: p.pocketbase_user_id, name: p.name, mmr: p.mmr, rank: p.rank, division: p.division })),
        room.teamB.map(p => ({ id: p.id, pocketbase_user_id: p.pocketbase_user_id, name: p.name, mmr: p.mmr, rank: p.rank, division: p.division }))
      ]
    },
    message: "Room successfully created!"
  });
}

export async function runMatchmakingTick(manager: IManager, io: Server) {
  const active = await isDemoModeActive();
  if (active || manager.players.length === 0) return;
  for (const room of manager.rooms.filter((r: MatchmakingRoom) => r.status === 'searching')) {
    const needed = 8 - room.getAllPlayers().length;
    if (needed <= 0) continue;
    const roomAvg = room.getAllPlayers().reduce((sum: number, p: Player) => sum + p.mmr, 0) / room.getAllPlayers().length;
    const candidates = findCompatiblePlayers(manager.players.filter((p: Player) => ((p as any).gameModeId || 1) === room.gameModeId), roomAvg).slice(0, needed);
    if (candidates.length > 0) {
      manager.players = manager.players.filter((p: Player) => !candidates.includes(p));
      candidates.forEach((p: Player) => p.setWaiting(room.id));
      distributeToTeams(room, candidates);
      candidates.forEach((p: Player) => {
        const socket = io.sockets.sockets.get(p.socketId || '');
        if (socket) socket.join(room.id);
      });
      if (room.getAllPlayers().length === 8) {
        room.status = 'ready_check';
        room.readyCheckStartTime = Date.now();
        room.readyTimeout = setTimeout(() => startMapVoting(room, io, manager.rooms), 60000);
        emitMatchFound(room, io);
      }
      broadcastRoomUpdate(room, io);
    }
  }
  const modeIds = Array.from(new Set(manager.players.map((p: Player) => (p as any).gameModeId || 1)));
  for (const mId of modeIds) {
    const modePlayers = manager.players.filter((p: Player) => ((p as any).gameModeId || 1) === mId);
    if (modePlayers.length >= 6) {
      const comps = findCompatiblePlayers(modePlayers, modePlayers[0].mmr).slice(0, 8);
      if (comps.length >= 6) {
        const room = new MatchmakingRoom(`room_${Date.now()}`);
        room.gameModeId = mId;
        manager.players = manager.players.filter((p: Player) => !comps.includes(p));
        comps.forEach((p: Player) => { p.setWaiting(room.id); const socket = io.sockets.sockets.get(p.socketId || ''); if (socket) socket.join(room.id); });
        distributeToTeams(room, comps);
        if (comps.length === 8) {
          room.status = 'ready_check';
          room.readyCheckStartTime = Date.now();
          room.readyTimeout = setTimeout(() => startMapVoting(room, io, manager.rooms), 60000);
          emitMatchFound(room, io);
        }
        manager.rooms.push(room);
        broadcastRoomUpdate(room, io);
      }
    }
  }
}
