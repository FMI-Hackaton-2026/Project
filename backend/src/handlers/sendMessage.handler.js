import Message from '../models/Message.js';
import SystemPrompt from '../models/SystemPrompt.js';
import { streamAIResponse, extractProfileData } from '../services/aiService.js';

const MAX_TURNS = 5;

export const sendMessageHandler = async (io, socket, payload) => {
  const userId = socket.userId; 
  // Normally sessionId should come from client or be generated per connection/conversation
  // For onboarding, we'll use a fixed 'onboarding' string for simplicity or pull from payload
  const sessionId = payload?.sessionId || 'onboarding';

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

  try {
    // 1. Save user message to DB
    await Message.create({
      userId,
      sessionId,
      role: 'user',
      content: message
    });

    // 2. Count turns
    const userMessageCount = await Message.countDocuments({
      userId,
      sessionId,
      role: 'user'
    });

    // 3. Termination Logic (CRITICAL)
    if (userMessageCount >= MAX_TURNS) {
      const finalMsgText = "Thank you for being so open. I have everything I need. Let's get started.";
      
      // Save forced assistant reply
      await Message.create({
        userId,
        sessionId,
        role: 'assistant',
        content: finalMsgText
      });

      // Emit hardcoded message
      socket.emit('SEND_MESSAGE', { message: finalMsgText });

      // Emit termination flag so client stays on onboarding until this is sent
      socket.emit('AI_REPLY_END', { onboarding_complete: true });
      socket.emit('END_MESSAGE');

      // 4. Trigger Background Extraction
      // Note: intentionally NOT awaiting this so the socket doesn't hang
      (async () => {
        try {
          console.log(`[Onboarding] Session ended for user ${userId}. Starting extraction...`);
          // Fetch the whole transcript
          const allMsgs = await Message.find({ userId, sessionId }).sort({ timestamp: 1 });
          const transcript = allMsgs.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\\n\\n');
          
          await extractProfileData(userId, transcript);
        } catch (err) {
          console.error("Background extraction failed:", err);
        }
      })();

      return; // Stop execution here
    }

    // --- STANDARD STREAMING RESPONSES --- //

    // 4. Context Assembly
    // Fetch system prompt
    let sysPromptDoc = await SystemPrompt.findOne({ prompt_id: 'onboarding_v1' });
    
    // Fallback if not injected in DB yet
    const sysPromptContent = sysPromptDoc ? sysPromptDoc.content : 
      "You are an empathetic AI addiction counselor. Get to know the user briefly. Ask short, guiding questions to understand their hobbies, financial stress, triggers, and family context gently.";

    // Fetch last ~6 messages for this session
    const recentMsgs = await Message.find({ userId, sessionId })
                                    .sort({ createdAt: -1 })
                                    .limit(6);
    // Reverse them so they are chronological
    recentMsgs.reverse();

    // Assemble the array for OpenAI
    const openAiMessages = [
      { role: 'system', content: sysPromptContent },
      ...recentMsgs.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    // 5. OpenAI Streaming via Socket.IO
    let fullAssistantResponse = '';

    // We pass callbacks to streamAIResponse to handle chunks
    await streamAIResponse(
      openAiMessages,
      // onChunk callback
      (chunkText) => {
        socket.emit('AI_REPLY_CHUNK', { text: chunkText });
      },
      // onComplete callback
      async (finalText) => {
        // Save the AI's full response back to DB
        await Message.create({
          userId,
          sessionId,
          role: 'assistant',
          content: finalText
        });
        
        socket.emit('AI_REPLY_END', { onboarding_complete: false });
      }
    );

  } catch (error) {
    console.error("Error in sendMessageHandler:", error);
    socket.emit('error', {
      event: 'SEND_MESSAGE',
      message: 'Failed to process AI request'
    });
  }
};