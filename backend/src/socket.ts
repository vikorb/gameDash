import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { MatchmakingManager } from './managers/MatchmakingManager';
import { getPlayerForQueue } from './services/playerService';
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

        socket.on('join_queue', async (data) => {
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

        socket.on('disconnect', () => {
            matchmakingManager.removePlayerBySocket(socket.id);
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });

    return io;
}
