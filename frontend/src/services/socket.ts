import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Parse the base URL without the /api path. Socket.io connects to root namespace by default.
// Vite VITE_API_URL might look like http://localhost:3000/api
const baseUrl = API_URL.replace('/api', '');

export const socket: Socket = io(baseUrl, {
  autoConnect: false,
});
