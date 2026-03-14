import { EVENTS } from "../constants/events.js";

export const handleEvents = (io, socket) => {
  for (const [event, handler] of Object.entries(EVENTS)) {
    socket.on(event, (payload) => {
      try {
        handler(io, socket, payload);
      } catch (err) {
        console.error(`Error in socket event "${event}":`, err);
        socket.emit('error', { event, message: 'Internal server error' });
      }
    });
  }
};