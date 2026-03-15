
export const sendMessageHandler = async (io, socket, payload) => {
  const userId = socket.userId; 

  if (!userId) {
    return socket.emit('error', {
      event: 'SEND_MESSAGE',
      message: 'Не сте аутентикиран',
    });
  }

  const { message } = payload ?? {};

  if (!message) {
    return socket.emit('error', {
      event: 'SEND_MESSAGE',
      message: 'message is required',
    });
  }

  // TODO: communicate with the AI microservice
  // const aiResponse = await aiService(userId, message);

  // TODO: emit the AI response back to the user
  // socket.emit('SEND_MESSAGE', { message: aiResponse });
};