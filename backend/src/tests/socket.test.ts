import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { createServer } from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { initSocket } from '../socket';
import { Player } from '../types/player';

// --- Mocks ---
// Mock database to avoid real DB connections
vi.mock('../database', () => {
    return {
        default: vi.fn(() => ({
            where: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            first: vi.fn().mockResolvedValue({ id: 1, pocketbase_user_id: 'pb_user_1' })
        }))
    };
});

// Mock playerService to easily return Player objects
vi.mock('../services/playerService', () => {
    // Generate simple sequential or random player ids to avoid collision
    let counter = 1;
    return {
        getPlayerForQueue: vi.fn(async (userId, modeId, socketId) => {
            const playerId = counter++;
            const player = new Player(
                `user_${playerId}`,
                `pb_user_${playerId}`,
                `Player_${playerId}`,
                'EU',
                'en',
                {},
                1000 + Math.random() * 200 - 100, // random MMR around 1000
                'Silver',
                2,
                'online'
            );
            if (socketId) player.socketId = socketId;
            return player;
        })
    };
});

describe('Socket and Matchmaking Integration', () => {
    let io: any;
    let serverSocket: any;
    let clientSocket: ClientSocket;
    let httpServer: any;
    const port = 4000;

    beforeAll(async () => {
        httpServer = createServer();
        io = initSocket(httpServer);
        await new Promise<void>((resolve) => httpServer.listen(port, resolve));
    });

    afterAll(() => {
        io.close();
        httpServer.close();
        vi.restoreAllMocks();
    });

    beforeEach(async () => {
        clientSocket = Client(`http://localhost:${port}`);
        await new Promise<void>((resolve) => {
            clientSocket.on('connect', resolve);
        });
    });

    afterEach(() => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
    });

    it('should connect and successfully join queue', async () => {
        await new Promise<void>((resolve, reject) => {
            clientSocket.on('queue_joined', (data) => {
                try {
                    expect(data.message).toBe('Successfully joined queue');
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });

            clientSocket.on('queue_error', (data) => {
                reject(new Error(data.message));
            });

            clientSocket.emit('join_queue', { pocketbaseUserId: 'pb_user_1', modeId: 1 });
        });
    });

    it('should trigger queue_error if missing required fields', async () => {
        await new Promise<void>((resolve, reject) => {
            clientSocket.on('queue_error', (data) => {
                try {
                    expect(data.message).toBe('Missing pocketbaseUserId or modeId');
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });

            clientSocket.emit('join_queue', { pocketbaseUserId: 'pb_user_test' }); // missing modeId
        });
    });

    it('should simulate 48 players joining and all finding a match', async () => {
        const TOTAL_PLAYERS = 48; // Multiple of 8 (teamSize 4 * 2 teams)

        // Connect clients
        const connectionPromises = Array.from({ length: TOTAL_PLAYERS }).map(() => {
            return new Promise<ClientSocket>((resolve) => {
                const c = Client(`http://localhost:${port}`);
                c.on('connect', () => resolve(c));
            });
        });

        const connectedClients = await Promise.all(connectionPromises);

        let matchesFoundCount = 0;

        const matchPromises = connectedClients.map((c, idx) => {
            return new Promise<void>((resolve, reject) => {
                c.on('queue_error', (err) => reject(new Error(err.message)));
                
                c.on('match_found', () => {
                    matchesFoundCount++;
                    c.disconnect();
                    resolve();
                });

                // Add slight delay between requests to simulate real world
                setTimeout(() => {
                    c.emit('join_queue', { pocketbaseUserId: `pb_user_${idx + 100}`, modeId: 1 });
                }, idx * 10);
            });
        });

        // Wait for all match promises to resolve. We give it a generous timeout
        await Promise.all(matchPromises);

        expect(matchesFoundCount).toBe(TOTAL_PLAYERS);
    }, 20000); // 20 seconds max to run several ticks
});
