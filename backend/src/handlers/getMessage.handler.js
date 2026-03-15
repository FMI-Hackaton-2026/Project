
export const getMessageHandler = async (io, socket, payload) => {
  const userId = socket.userId;

  if (!userId) {
    return socket.emit('error', {
      event: 'GET_MESSAGE',
      message: 'Не сте аутентикиран',
    });
  }

  socket.emit('GET_MESSAGE', {
    message: messages,
    end,
  });
};