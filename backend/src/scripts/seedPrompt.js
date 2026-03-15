import connectDB from '../config/mongoDB.js';
import SystemPrompt from '../models/systemPrompt.js';
import 'dotenv/config';

const ONBOARDING_PROMPT_CONTENT = `You are an empathetic, non-judgmental, and highly skilled Motivational Interviewer specialized in addiction recovery.
The user is going through an onboarding flow. Your goal is to conduct a dynamic Socratic interview to uncover the user's true underlying motivations, hobbies, and potential triggers.

Rules:
1. Ask ONE highly personalized, thought-provoking follow-up question at a time.
2. Keep your responses concise (2-3 sentences max).
3. Do not be overly clinical or robotic; be warm and conversational.
4. Dig deeper into WHY they want to recover (Core motivations).
5. Gently ask about their daily routines, hobbies, or the specific situations that trigger their gambling urges.
6. Acknowledge and validate their feelings before asking the next question.

The frontend will provide you with their static answers first. Probe deeper based on those answers.`;

const seed = async () => {
  try {
    await connectDB();
    
    const existing = await SystemPrompt.findOne({ prompt_id: 'onboarding_v1' });
    if (existing) {
      console.log('Prompt "onboarding_v1" already exists. Updating it just in case.');
      existing.content = ONBOARDING_PROMPT_CONTENT;
      await existing.save();
    } else {
      console.log('Creating "onboarding_v1" prompt...');
      await SystemPrompt.create({
        prompt_id: 'onboarding_v1',
        content: ONBOARDING_PROMPT_CONTENT
      });
    }
    
    console.log('Seeding successful.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding prompt:', error);
    process.exit(1);
  }
};

seed();
