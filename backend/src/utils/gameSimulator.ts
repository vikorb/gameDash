import { MatchmakingRoom } from '../types/MatchmakingRoom';
import { Player } from '../types/player';
import { Server } from 'socket.io';
import { broadcastRoomUpdate } from './roomMatcher';
import { saveFinishedMatch } from '../services/matchSaver';

const createBot = (idx: number) => new Player(
  `bot_${Date.now()}_${idx}`, `bot_pb_${idx}`, `Test Bot ${idx + 1}`,
  'EU', 'en', {}, 1000, 'Silver', 2, 'waiting'
);

export function startDemoRoom(player: Player, io: Server, rooms: MatchmakingRoom[]) {
  const room = new MatchmakingRoom(`demo_${Date.now()}`);
  room.status = 'searching';
  room.teamA.push(player);
  player.roomId = room.id;
  player.status = 'waiting';
  rooms.push(room);

  const socket = io.sockets.sockets.get(player.socketId || '');
  if (socket) socket.join(room.id);

  const addBot = (idx: number) => {
    const bot = createBot(idx);
    bot.roomId = room.id;
    (room.teamA.length < 4 ? room.teamA : room.teamB).push(bot);
  };

  for (let i = 0; i < 5; i++) addBot(i);
  broadcastRoomUpdate(room, io);

  setTimeout(() => {
    if (!rooms.includes(room) || room.status !== 'searching') return;
    addBot(5);
    broadcastRoomUpdate(room, io);

    setTimeout(() => {
      if (!rooms.includes(room) || room.status !== 'searching') return;
      addBot(6);
      room.status = 'ready_check';
      room.readyCheckStartTime = Date.now();
      broadcastRoomUpdate(room, io);
      room.readyTimeout = setTimeout(() => launchGame(room, io, rooms), 60000);

      room.getAllPlayers().filter(p => p.id.toString().startsWith('bot_')).forEach(bot => {
        setTimeout(() => {
          if (!rooms.includes(room) || room.status !== 'ready_check') return;
          room.readyStates[bot.id] = true;
          broadcastRoomUpdate(room, io);
          if (room.getAllPlayers().every(p => room.readyStates[p.id])) {
            launchGame(room, io, rooms);
          }
        }, 5000 + Math.random() * 10000);
      });
    }, 2000);
  }, 5000);
}

export function launchGame(room: MatchmakingRoom, io: Server, rooms: MatchmakingRoom[]) {
  if (room.readyTimeout) clearTimeout(room.readyTimeout);
  room.status = 'in_game';
  io.to(room.id).emit('game_started', { roomId: room.id });

  room.gameTimeout = setTimeout(async () => {
    const winner = Math.random() < 0.5 ? 'Team A' : 'Team B';
    try {
      const res = await saveFinishedMatch({
        gameModeId: 1, winnerTeamName: winner,
        teamAPlayers: room.teamA, teamBPlayers: room.teamB
      });
      io.to(room.id).emit('game_ended', { roomId: room.id, winner, rewards: res?.rewardsGranted || {} });
    } catch {
      io.to(room.id).emit('game_ended', { roomId: room.id, winner, rewards: {} });
    }
    room.getAllPlayers().forEach(p => p.endGame());
    const idx = rooms.indexOf(room);
    if (idx !== -1) rooms.splice(idx, 1);
  }, 10000);
}
