import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../middlewares/socketAuth.js';
import { handleEvents } from '../handlers/index.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [process.env.FRONTEND_URL],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} | user: ${socket.userId}`);

    handleEvents(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} | reason: ${reason}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO has not been initialized. Call initSocket() first.');
  return io;
};