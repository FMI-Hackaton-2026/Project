import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '../api/config';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';

let socket: Socket | null = null;

/**
 * Initialize Socket.IO client and connect with auth tokens.
 * Call when the user is authenticated. Idempotent: re-calling with new tokens
 * reconnects with updated auth.
 */
export function initSocket(accessToken: string, refreshToken: string | null): Socket {
  disconnectSocket();
  useSocketStore.getState().setConnected(false);

  socket = io(SOCKET_URL, {
    auth: { accessToken, refreshToken: refreshToken ?? undefined },
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });

  socket.on('connect', () => {
    useSocketStore.getState().setConnected(true);
  });

  socket.on('REFRESH', (payload: { accessToken: string; refreshToken: string }) => {
    const { setTokens } = useAuthStore.getState();
    if (payload.accessToken && payload.refreshToken) {
      setTokens(payload.accessToken, payload.refreshToken);
    }
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connect_error:', err.message);
  });

  socket.on('disconnect', () => {
    useSocketStore.getState().setConnected(false);
  });

  socket.on('error', (payload: { event?: string; message?: string }) => {
    console.warn('Socket error:', payload);
  });

  return socket;
}

/**
 * Disconnect and clear the socket instance. Call on logout.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  useSocketStore.getState().setConnected(false);
}

/**
 * Return the current socket instance if connected. Use for emitting/listening to custom events.
 */
export function getSocket(): Socket | null {
  return socket;
}
