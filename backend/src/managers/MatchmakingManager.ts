import { Server } from 'socket.io';
import { Player } from '../types/player';
import { MatchmakingRoom } from '../types/MatchmakingRoom';
import { isDemoModeActive } from '../utils/demoMode';
import { startDemoRoom, launchGame } from '../utils/gameSimulator';
import { broadcastRoomUpdate } from '../utils/roomMatcher';
import { runMatchmakingTick } from '../utils/tickHelper';

export class MatchmakingManager {
  public players: Player[] = [];
  public rooms: MatchmakingRoom[] = [];
  private io: Server;
  private interval: NodeJS.Timeout | null = null;

  constructor(io: Server) { this.io = io; }

  public startLoop() {
    if (!this.interval) this.interval = setInterval(() => this.tick(), 3000);
  }

  public stopLoop() {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
  }

  public async addPlayer(player: Player) {
    if (this.players.some(p => p.id === player.id)) return;
    const active = await isDemoModeActive();
    if (active) {
      setTimeout(() => startDemoRoom(player, this.io, this.rooms), 3000);
    } else {
      player.enterQueue();
      this.players.push(player);
    }
  }

  public removePlayer(userId: string | number) {
    this.players = this.players.filter(p => p.id !== userId);
    this.handlePlayerLeave(userId);
  }

  public removePlayerBySocket(socketId: string) {
    this.players = this.players.filter(pl => pl.socketId !== socketId);
    const room = this.rooms.find(r => r.getAllPlayers().some(pl => pl.socketId === socketId));
    if (room) {
      const pl = room.getAllPlayers().find(player => player.socketId === socketId);
      if (pl) this.handlePlayerLeave(pl.id);
    }
  }

  public playerReady(playerId: string | number, roomId: string) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    room.readyStates[playerId] = true;
    broadcastRoomUpdate(room, this.io);
    const allReady = room.getAllPlayers().every(p => room.readyStates[p.id]);
    if (allReady) launchGame(room, this.io, this.rooms);
  }

  public handlePlayerLeave(playerId: string | number) {
    const room = this.rooms.find(r => r.getAllPlayers().some(p => p.id === playerId));
    if (!room) return;

    if (room.readyTimeout) { clearTimeout(room.readyTimeout); room.readyTimeout = null; }
    if (room.gameTimeout) { clearTimeout(room.gameTimeout); room.gameTimeout = null; }

    room.teamA = room.teamA.filter(p => p.id !== playerId);
    room.teamB = room.teamB.filter(p => p.id !== playerId);
    room.status = 'searching';
    delete room.readyStates[playerId];

    broadcastRoomUpdate(room, this.io);
  }

  private tick() {
    runMatchmakingTick(this, this.io);
  }
}
