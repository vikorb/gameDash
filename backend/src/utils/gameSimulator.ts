import { Server } from 'socket.io';
import { saveFinishedMatch } from '../services/matchSaver';
import { MatchmakingRoom } from '../types/MatchmakingRoom';
import { Player } from '../types/player';
import { startMapVoting } from './mapVoting';
import { broadcastRoomUpdate } from './roomMatcher';
const createBot = (idx: number) => new Player(`bot_${Date.now()}_${idx}`, `bot_pb_${idx}`, `Test Bot ${idx + 1}`, 'EU', 'en', {}, 1000, 'Silver', 2, 'waiting');
export function startDemoRoom(player: Player, io: Server, rooms: MatchmakingRoom[]) {
  const room = new MatchmakingRoom(`demo_${Date.now()}`);
  room.gameModeId = (player as any).gameModeId || 1;
  room.status = 'searching';
  player.roomId = room.id;
  player.status = 'waiting';
  rooms.push(room);
  const socket = io.sockets.sockets.get(player.socketId || '');
  if (socket) socket.join(room.id);
  const add = (p: Player) => {
    const a = room.teamA.length < 4, b = room.teamB.length < 4;
    (a && b ? (Math.random() < 0.5 ? room.teamA : room.teamB) : (a ? room.teamA : room.teamB)).push(p);
  };
  add(player);
  broadcastRoomUpdate(room, io);
  let botIdx = 0;
  const interval = setInterval(() => {
    if (!rooms.includes(room) || room.status !== 'searching') {
      clearInterval(interval);
      return;
    }
    if (botIdx < 7) {
      const count = botIdx === 6 ? 1 : 2;
      for (let i = 0; i < count; i++) {
        const bot = createBot(botIdx++);
        bot.roomId = room.id;
        (bot as any).gameModeId = room.gameModeId;
        add(bot);
      }
      broadcastRoomUpdate(room, io);
    } else {
      clearInterval(interval);
      room.status = 'ready_check';
      room.readyCheckStartTime = Date.now();
      broadcastRoomUpdate(room, io);
      room.readyTimeout = setTimeout(() => startMapVoting(room, io, rooms), 60000);
      room.getAllPlayers().filter(p => p.id.toString().startsWith('bot_')).forEach(bot => {
        setTimeout(() => {
          if (!rooms.includes(room) || room.status !== 'ready_check') return;
          room.readyStates[bot.id] = true;
          broadcastRoomUpdate(room, io);
          if (room.getAllPlayers().every(p => room.readyStates[p.id])) startMapVoting(room, io, rooms);
        }, 5000 + Math.random() * 10000);
      });
    }
  }, 1000);
}

export function launchGame(room: MatchmakingRoom, io: Server, rooms: MatchmakingRoom[]) {
  if (room.readyTimeout) clearTimeout(room.readyTimeout);
  room.status = 'in_game';
  io.to(room.id).emit('game_started', { roomId: room.id, map: room.selectedMap });

  room.gameTimeout = setTimeout(async () => {
    const winner = Math.random() < 0.5 ? 'Team A' : 'Team B';
    try {
      const res = await saveFinishedMatch({
        gameModeId: room.gameModeId || 1, winnerTeamName: winner,
        teamAPlayers: room.teamA, teamBPlayers: room.teamB,
        mapId: room.selectedMap?.id
      });
      io.to(room.id).emit('game_ended', { roomId: room.id, winner, rewards: res?.rewardsGranted || {} });
    } catch (err) {
      console.error('[launchGame] saveFinishedMatch failed:', err);
      io.to(room.id).emit('game_ended', { roomId: room.id, winner, rewards: {} });
    }
    room.getAllPlayers().forEach(p => p.endGame());
    const idx = rooms.indexOf(room);
    if (idx !== -1) rooms.splice(idx, 1);
  }, 10000);
}
