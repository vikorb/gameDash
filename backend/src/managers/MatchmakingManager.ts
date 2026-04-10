import { Server } from 'socket.io';
import { Player } from '../types/player';
import { createGame } from '../utils/matchmaking';

export class MatchmakingManager {
    private players: Player[] = [];
    private io: Server;
    private matchmakingInterval: NodeJS.Timeout | null = null;

    constructor(io: Server) {
        this.io = io;
    }

    public startLoop() {
        if (this.matchmakingInterval) return;
        this.matchmakingInterval = setInterval(() => this.tick(), 3000); // Poll every 3 seconds
        console.log('[MatchmakingManager] Loop started.');
    }

    public stopLoop() {
        if (this.matchmakingInterval) {
            clearInterval(this.matchmakingInterval);
            this.matchmakingInterval = null;
        }
    }

    public addPlayer(player: Player) {
        if (this.players.some(p => p.id === player.id)) {
            return;
        }
        player.enterQueue();
        this.players.push(player);
        console.log(`[Queue] Player ${player.name} added. Total in queue: ${this.players.length}`);
    }

    public removePlayer(userId: string | number) {
        this.players = this.players.filter(p => p.id !== userId);
        console.log(`[Queue] Player removed. Total in queue: ${this.players.length}`);
    }

    public removePlayerBySocket(socketId: string) {
        const initialLength = this.players.length;
        this.players = this.players.filter(p => p.socketId !== socketId);
        if (this.players.length < initialLength) {
            console.log(`[Queue] Player removed via Socket disconnect. Total in queue: ${this.players.length}`);
        }
    }

    private async tick() {
        if (this.players.length === 0) return;

        // In a real scenario, you probably want to partition players by game modes 
        // For now, we simulate one master queue and one roomId.
        const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // createGame requires teamSize and numTeams; using defaults 4 and 2.
        const result = await createGame(this.players, roomId, 4, 2);
        
        if (result) {
            const playersInGame = result.teams.flat();
            const playerIdsInGame = playersInGame.map(p => p.id);
            
            // Remove successful players from the queue
            this.players = this.players.filter(p => !playerIdsInGame.includes(p.id));

            console.log(`[Queue] Room ${roomId} created! Remaining in queue: ${this.players.length}`);

            // Group players into a Socket.io room to isolate their future communication
            for (const player of playersInGame) {
                if (player.socketId) {
                    const socket = this.io.sockets.sockets.get(player.socketId);
                    if (socket) {
                        socket.join(roomId);
                    }
                }
            }
            
            // Broadcast the Match Found event
            this.io.to(roomId).emit('match_found', {
                roomId,
                game: result,
                message: "Room successfully created!"
            });
        }
    }
}
