import { EVENTS } from "../constants/events.js";
import { emitRefreshedTokens } from "../middlewares/socketAuth.js";

export const handleEvents = (io, socket) => {
  emitRefreshedTokens(socket);

  for (const [event, handler] of Object.entries(EVENTS)) {
    socket.on(event, async (payload) => {
      try {
        await handler(io, socket, payload);
      } catch (err) {
        console.error(`Error in socket event "${event}":`, err);
        socket.emit('error', { event, message: 'Internal server error' });
      }
    });
  }
};