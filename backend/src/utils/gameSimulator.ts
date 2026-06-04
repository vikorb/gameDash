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
  for (let i = 0; i < 5; i++) {
    const bot = createBot(i);
    bot.roomId = room.id;
    add(bot);
  }
  broadcastRoomUpdate(room, io);

  setTimeout(() => {
    if (!rooms.includes(room) || room.status !== 'searching') return;
    const b5 = createBot(5); b5.roomId = room.id; add(b5);
    broadcastRoomUpdate(room, io);

    setTimeout(() => {
      if (!rooms.includes(room) || room.status !== 'searching') return;
      const b6 = createBot(6); b6.roomId = room.id; add(b6);
      room.status = 'ready_check';
      room.readyCheckStartTime = Date.now();
      broadcastRoomUpdate(room, io);
      room.readyTimeout = setTimeout(() => launchGame(room, io, rooms), 60000);

      room.getAllPlayers().filter(p => p.id.toString().startsWith('bot_')).forEach(bot => {
        setTimeout(() => {
          if (!rooms.includes(room) || room.status !== 'ready_check') return;
          room.readyStates[bot.id] = true;
          broadcastRoomUpdate(room, io);
          if (room.getAllPlayers().every(p => room.readyStates[p.id])) launchGame(room, io, rooms);
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
    } catch (err) {
      console.error('[launchGame] saveFinishedMatch failed:', err);
      io.to(room.id).emit('game_ended', { roomId: room.id, winner, rewards: {} });
    }
    room.getAllPlayers().forEach(p => p.endGame());
    const idx = rooms.indexOf(room);
    if (idx !== -1) rooms.splice(idx, 1);
  }, 10000);
}
