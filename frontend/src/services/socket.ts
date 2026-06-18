import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Parse the base URL without the /api path. Socket.io connects to root namespace by default.
// Vite VITE_API_URL might look like http://localhost:3000/api
let baseUrl = API_URL.replace('/api', '');

// Handle relative endpoint in production/proxy mode
if (baseUrl.startsWith('/')) {
  baseUrl = window.location.origin;
}

export const socket: Socket = io(baseUrl, {
  autoConnect: false,
});

const originalEmit = socket.emit;
socket.emit = function (event: string, ...args: unknown[]) {
  if (event === 'join_queue' && args[0] && typeof args[0] === 'object') {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('selectedModeId') : null;
    if (saved) {
      (args[0] as Record<string, unknown>).modeId = Number(saved);
    }
  }
  return originalEmit.apply(this, [event, ...args] as Parameters<typeof originalEmit>);
};
