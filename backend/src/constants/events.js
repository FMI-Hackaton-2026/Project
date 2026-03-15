import { getMessageHandler } from '../handlers/getMessage.handler.js';
import { sendMessageHandler } from '../handlers/sendMessage.handler.js';

export const EVENTS = {
  GET_MESSAGE: getMessageHandler,
  SEND_MESSAGE: sendMessageHandler
};