import { sendMessageHandler } from '../handlers/sendMessage.handler.js';
import { initMainChatHandler, sendMainMessageHandler } from '../handlers/mainChat.handler.js';

export const EVENTS = {
  GET_MESSAGE: getMessageHandler,
  SEND_MESSAGE: sendMessageHandler,
  INIT_MAIN_CHAT: initMainChatHandler,
  SEND_MAIN_MESSAGE: sendMainMessageHandler,
};