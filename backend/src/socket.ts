import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { MatchmakingManager } from './managers/MatchmakingManager';
import { getPlayerForQueue } from './services/playerService';
import { Player } from './types/player';
import db from './database';

let io: Server;
let matchmakingManager: MatchmakingManager;

export function initSocket(server: HttpServer) {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    matchmakingManager = new MatchmakingManager(io);
    matchmakingManager.startLoop();

    io.on('connection', (socket: Socket) => {
        console.log(`[Socket] New connection: ${socket.id}`);

        socket.on('join_queue', async (data: any) => {
            // Data expects { pocketbaseUserId: string, modeId: number }
            const { pocketbaseUserId, modeId } = data;
            
            if (!pocketbaseUserId || !modeId) {
                return socket.emit('queue_error', { message: 'Missing pocketbaseUserId or modeId' });
            }

            try {
                // Find internal Database ID for this pocketbase user
                const userRow = await db('users').where({ pocketbase_user_id: pocketbaseUserId }).select('id').first();
                if (!userRow) {
                    return socket.emit('queue_error', { message: 'User not found' });
                }

                const player = await getPlayerForQueue(userRow.id, modeId, socket.id);
                if (player) {
                    matchmakingManager.addPlayer(player);
                    socket.emit('queue_joined', { message: 'Successfully joined queue' });
                } else {
                    socket.emit('queue_error', { message: 'Failed to construct player object' });
                }
            } catch (err) {
                console.error(err);
                socket.emit('queue_error', { message: 'Internal server error while joining queue' });
            }
        });

        socket.on('leave_queue', () => {
            matchmakingManager.removePlayerBySocket(socket.id);
            socket.emit('queue_left', { message: 'Successfully left queue' });
        });

        socket.on('simulate_matchmaking', async (data: any) => {
            console.log(`[Socket] Simulating matchmaking for: ${socket.id}`);
            const { pocketbaseUserId, modeId } = data || {};
            
            if (!pocketbaseUserId || !modeId) {
                return socket.emit('queue_error', { message: 'Missing pocketbaseUserId or modeId for simulation' });
            }

            try {
                // Join the actual user
                const userRow = await db('users').where({ pocketbase_user_id: pocketbaseUserId }).select('id').first();
                if (!userRow) {
                    return socket.emit('queue_error', { message: 'User not found' });
                }
                const player = await getPlayerForQueue(userRow.id, modeId, socket.id);
                if (player) {
                    matchmakingManager.addPlayer(player);
                    socket.emit('queue_joined', { message: 'Successfully joined queue for simulation' });
                } else {
                    return socket.emit('queue_error', { message: 'Failed to construct player object' });
                }
            } catch (err) {
                console.error(err);
                return socket.emit('queue_error', { message: 'Internal server error while joining queue' });
            }

            // Generate 5 dummy players immediately
            for (let i = 0; i < 5; i++) {
                const dummy = new Player(
                    `dummy_${Date.now()}_${i}`,
                    `dummy_pb_${Math.random()}`,
                    `Test Bot ${i + 1}`,
                    'EU',
                    'en',
                    {},
                    1000 + Math.random() * 200 - 100, // random MMR around 1000
                    'Silver',
                    2,
                    'online'
                );
                matchmakingManager.addPlayer(dummy);
            }
            socket.emit('simulation_started', { message: 'You have joined the queue and 5 dummy players added immediately!' });

            // Generate remaining 2 players after a 3-second delay
            setTimeout(() => {
                for (let i = 5; i < 7; i++) {
                    const dummy = new Player(
                        `dummy_${Date.now()}_${i}`,
                        `dummy_pb_${Math.random()}`,
                        `Test Bot ${i + 1}`,
                        'EU',
                        'en',
                        {},
                        1000 + Math.random() * 200 - 100,
                        'Silver',
                        2,
                        'online'
                    );
                    matchmakingManager.addPlayer(dummy);
                }
                socket.emit('simulation_delayed_players', { message: '2 more dummy players have arrived!' });
            }, 3000);
        });

        socket.on('disconnect', () => {
            matchmakingManager.removePlayerBySocket(socket.id);
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });

    return io;
}
