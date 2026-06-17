import { Server, Socket } from 'socket.io';
import db from '../database';
import { MatchmakingManager } from '../managers/MatchmakingManager';
import { getPlayerForQueue } from '../services/playerService';
import { isDemoModeActive, setDemoModeActive } from './demoMode';
import { resolveMapVoting } from './mapVoting';
import { broadcastRoomUpdate } from './roomMatcher';

export function registerSocketHandlers(socket: Socket, io: Server, mmManager: MatchmakingManager) {
  socket.on('join_queue', async (data: { pocketbaseUserId?: string; modeId?: number }) => {
    const { pocketbaseUserId, modeId } = data || {};
    if (!pocketbaseUserId || !modeId) return socket.emit('queue_error', { message: 'Missing pocketbaseUserId or modeId' });

    try {
      const user = await db('users').where({ pocketbase_user_id: pocketbaseUserId }).first();
      if (!user) return socket.emit('queue_error', { message: 'User not found' });

      const player = await getPlayerForQueue(user.id, modeId, socket.id);
      if (player) {
        mmManager.addPlayer(player);
        const active = await isDemoModeActive();
        socket.emit('queue_joined', { message: 'Successfully joined queue', isDemoMode: active });
      }
    } catch (err) {
      console.error(err);
      socket.emit('queue_error', { message: 'Server error' });
    }
  });

  socket.on('player_ready', (data: { roomId: string; playerId: string | number }) => {
    mmManager.playerReady(data.playerId, data.roomId);
  });

  socket.on('cast_vote', (data: { roomId: string; playerId: string | number; mapId: number | null }) => {
    const room = mmManager.rooms.find(r => r.id === data.roomId);
    if (!room || room.status !== 'map_voting') return;
    room.votes[data.playerId] = data.mapId;
    broadcastRoomUpdate(room, io);

    const allVoted = room.getAllPlayers().every(player => room.votes[player.id] !== undefined);
    if (allVoted) resolveMapVoting(room, io, mmManager.rooms);
  });

  socket.on('leave_room', (data: { roomId: string; playerId: string | number }) => {
    mmManager.handlePlayerLeave(data.playerId);
    socket.leave(data.roomId);
    socket.emit('queue_left');
  });

  socket.on('toggle_demo_mode', async (data: { enabled: boolean }) => {
    await setDemoModeActive(data.enabled);
    io.emit('demo_mode_changed', { enabled: data.enabled });
  });

  socket.on('leave_queue', () => {
    const room = mmManager.rooms.find(r => r.getAllPlayers().some(pl => pl.socketId === socket.id));
    if (room && room.status !== 'searching') {
      mmManager.players = mmManager.players.filter(pl => pl.socketId !== socket.id);
    } else {
      mmManager.removePlayerBySocket(socket.id);
    }
  });

  socket.on('disconnect', () => {
    mmManager.removePlayerBySocket(socket.id);
  });
}
