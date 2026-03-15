import express from 'express';
import SystemPrompt from '../models/systemPrompt.js';
import Message from '../models/message.js';
import AIProfile from '../models/aiProfile.js';
import { generateOnboardingQuestion, extractProfileData } from '../services/ai_service.js';

const router = express.Router();

/**
 * POST /api/onboarding/chat
 * Handles Step 1, 2, and 3: The dynamic Socratic interviewing loop.
 * Body: { user_id, session_id, message }
 */
router.post('/chat', async (req, res) => {
  try {
    const { user_id, session_id, message } = req.body;

    if (!user_id || !session_id || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Save the incoming user message (or static answers if first step)
    await Message.create({
      user_id,
      session_id,
      role: 'user',
      content: message,
    });

    // 2. Fetch the Master System Prompt
    const systemPrompt = await SystemPrompt.findOne({ prompt_id: 'onboarding_v1' });
    if (!systemPrompt) {
      return res.status(500).json({ error: 'System prompt not found in database. Did you run the seed script?' });
    }

    // 3. Fetch the last ~10 messages for conversational context
    // We sort ascending to keep chronological order for the AI
    const recentMessages = await Message.find({ session_id })
      .sort({ timestamp: -1 })
      .limit(10)
      .exec();
    
    recentMessages.reverse(); // Reverse back to chronological

    // 4. Hit the AI Service
    // We exclude the very last user message from recentMessages since we pass it explicitly, 
    // or we can just pass the previous 9 and the latest one. Let's pass the historical ones without the latest user message.
    const history = recentMessages.slice(0, -1);
    
    const aiResponse = await generateOnboardingQuestion(
      systemPrompt.content,
      history,
      message
    );

    // 5. Save the AI's response
    await Message.create({
      user_id,
      session_id,
      role: 'assistant',
      content: aiResponse,
    });

    // 6. Return the next question
    return res.status(200).json({ question: aiResponse });

  } catch (error) {
    console.error('Error in onboarding chat:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/onboarding/extract
 * Handles Step 4 & 5: The background Extraction Hook and saves the AI Profile.
 * Body: { user_id, session_id }
 */
router.post('/extract', async (req, res) => {
  try {
    const { user_id, session_id } = req.body;

    if (!user_id || !session_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Fetch the entire chat transcript
    const transcript = await Message.find({ session_id }).sort({ timestamp: 1 }).exec();
    if (!transcript || transcript.length === 0) {
      return res.status(400).json({ error: 'No messages found for this session.' });
    }

    // 2. Call the extraction hook
    const extractedData = await extractProfileData(transcript);

    // 3. Save the extracted JSON to AIProfile
    const profile = await AIProfile.findOneAndUpdate(
      { user_id },
      {
        financial_goals: extractedData.financial_goals,
        family_context: extractedData.family_context,
        known_triggers: extractedData.known_triggers || [],
        hobbies: extractedData.hobbies || [],
        resilience_score: extractedData.resilience_score,
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ 
      success: true, 
      message: 'Profile successfully extracted and saved.',
      profile
    });

  } catch (error) {
    console.error('Error in onboarding extract:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
