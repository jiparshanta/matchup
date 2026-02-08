import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

let socket: Socket | null = null;

// Check if socket should be enabled (only if URL is configured)
function isSocketEnabled(): boolean {
  return !!SOCKET_URL && typeof window !== 'undefined';
}

export function getSocket(): Socket | null {
  if (!isSocketEnabled()) {
    return null;
  }
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
}

export function connectSocket(token: string): void {
  const s = getSocket();
  if (!s) return;
  s.auth = { token };
  s.connect();
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
  }
}

export function joinGameRoom(gameId: string): void {
  const s = getSocket();
  if (s?.connected) {
    s.emit('join-game', gameId);
  }
}

export function leaveGameRoom(gameId: string): void {
  const s = getSocket();
  if (s?.connected) {
    s.emit('leave-game', gameId);
  }
}
