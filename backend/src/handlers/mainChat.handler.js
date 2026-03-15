import Message from '../models/Message.js';
import AIProfile from '../models/AIProfile.js';
import { streamAIResponse } from '../services/aiService.js';

// Phase 1: The Initial Greeting
export const initMainChatHandler = async (io, socket, payload) => {
  const userId = socket.userId;
  const sessionId = payload?.sessionId || 'main_chat';

  if (!userId) {
    return socket.emit('error', {
      event: 'INIT_MAIN_CHAT',
      message: 'Unauthenticated user',
    });
  }

  try {
    // 1. Fetch AI Profile
    const profile = await AIProfile.findOne({ userId });

    if (!profile) {
      return socket.emit('error', {
        event: 'INIT_MAIN_CHAT',
        message: 'AI profile not found. Please complete onboarding.',
      });
    }

    // 2. Prepare the personalized greeting prompt
    const greetingPrompt = `You are an empathetic addiction recovery coach. You are talking to this user. 
Their goal is: ${profile.financial_goals}. 
Their hobbies are: ${profile.hobbies.join(', ')}. 
Write a short, warm, 2-sentence welcoming message to start their session today. 
Reference one of their goals or hobbies naturally to show you remember them. Do not sound robotic.
CRITICAL: You MUST speak entirely in Bulgarian (Български език). Never use English.`;

    const openAiMessages = [
      { role: 'system', content: greetingPrompt },
    ];

    let fullAssistantResponse = '';

    // 3. Stream the greeting
    await streamAIResponse(
      openAiMessages,
      (chunkText) => {
        socket.emit('MAIN_CHAT_CHUNK', { text: chunkText });
      },
      async (finalText) => {
        // Save the AI's greeting to the DB
        await Message.create({
          userId,
          sessionId,
          role: 'assistant',
          content: finalText
        });
        
        socket.emit('MAIN_CHAT_END', { success: true });
      }
    );

  } catch (error) {
    console.error("Error in initMainChatHandler:", error);
    socket.emit('error', {
      event: 'INIT_MAIN_CHAT',
      message: 'Failed to initialize main chat'
    });
  }
};

// Phase 2: The Core Chat Loop
export const sendMainMessageHandler = async (io, socket, payload) => {
  const userId = socket.userId;
  const sessionId = payload?.sessionId || 'main_chat';

  if (!userId) {
    return socket.emit('error', {
      event: 'SEND_MAIN_MESSAGE',
      message: 'Unauthenticated user',
    });
  }

  const { message } = payload ?? {};

  if (!message) {
    return socket.emit('error', {
      event: 'SEND_MAIN_MESSAGE',
      message: 'Message is required',
    });
  }

  try {
    // 1. Fetch AI Profile
    const profile = await AIProfile.findOne({ userId });

    if (!profile) {
      return socket.emit('error', {
        event: 'SEND_MAIN_MESSAGE',
        message: 'AI profile not found.',
      });
    }

    // 2. Step A: Retrieve Clinical Context (The RAG Fetch)
    let ragContext = '';
    try {
      const ragResponse = await fetch('http://127.0.0.1:8000/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          datasetId: 'clinical-manuals-v1'
        })
      });

      if (ragResponse.ok) {
        const ragData = await ragResponse.json();
        if (ragData && ragData.results && Array.isArray(ragData.results)) {
          // Join the returned text chunks
          ragContext = ragData.results.join('\\n\\n');
        }
      } else {
        console.warn(`RAG API returned non-ok status: ${ragResponse.status}`);
      }
    } catch (ragError) {
      console.error("Error fetching from Python RAG API:", ragError);
      // We continue even if RAG fails, so the user isn't totally blocked
    }

    // 3. Step B: Assemble the Dynamic System Prompt
    const systemPrompt = `
You are an elite, highly empathetic clinical AI specializing in addiction recovery. 
You use Motivational Interviewing (MI) and Cognitive Behavioral Therapy (CBT).

USER PROFILE (Do not explicitly list this to the user, just use it to understand them):
- Financial Goals: ${profile.financial_goals || 'None specified'}
- Family Context: ${profile.family_context || 'None specified'}
- Known Triggers: ${(profile.known_triggers || []).join(', ') || 'None specified'}
- Hobbies & Outlets: ${(profile.hobbies || []).join(', ') || 'None specified'}

RELEVANT CLINICAL PROTOCOLS (Apply these guidelines if relevant to the user's current message):
"""
${ragContext}
"""

YOUR INSTRUCTIONS:
1. Be warm, conversational, and deeply supportive. Never sound robotic.
2. If the user mentions an urge, gently apply the clinical protocols provided above (like Urge Surfing or Socratic questioning).
3. Keep responses concise and optimized for a mobile chat interface. Do not write massive walls of text.
4. If the user needs a distraction, naturally suggest one of their known hobbies or tools.
5. CRITICAL: You MUST speak entirely in Bulgarian (Български език). Never use English.
`;

    // 4. Save user message to DB
    await Message.create({
      userId,
      sessionId,
      role: 'user',
      content: message
    });

    // 5. Assemble History & Stream
    // Fetch last ~6 messages
    const recentMsgs = await Message.find({ userId, sessionId })
                                    .sort({ createdAt: -1 })
                                    .limit(6);
    recentMsgs.reverse();

    const openAiMessages = [
      { role: 'system', content: systemPrompt },
      ...recentMsgs.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    // Stream the AI Response
    await streamAIResponse(
      openAiMessages,
      (chunkText) => {
        socket.emit('MAIN_CHAT_CHUNK', { text: chunkText });
      },
      async (finalText) => {
        // Save full AI response back to DB
        await Message.create({
          userId,
          sessionId,
          role: 'assistant',
          content: finalText
        });
        
        socket.emit('MAIN_CHAT_END', { success: true });
      }
    );

  } catch (error) {
    console.error("Error in sendMainMessageHandler:", error);
    socket.emit('error', {
      event: 'SEND_MAIN_MESSAGE',
      message: 'Failed to process AI request'
    });
  }
};
