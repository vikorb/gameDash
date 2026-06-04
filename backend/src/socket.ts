import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { MatchmakingManager } from './managers/MatchmakingManager';
import { registerSocketHandlers } from './utils/socketHandlers';

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
        registerSocketHandlers(socket, io, matchmakingManager);
    });

    return io;
}
