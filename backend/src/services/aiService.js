import OpenAI from 'openai';
import AIProfile from '../models/AIProfile.js';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const streamAIResponse = async (messages, onChunk, onComplete) => {
  let fullContent = '';
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or gpt-4o depending on budget/speed needs
      messages: messages,
      stream: true,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;
      onChunk(content);
    }

    onComplete(fullContent);
    return fullContent;
  } catch (error) {
    console.error('Error in OpenAI stream:', error);
    const fallback = '[Грешка при свързване с AI. Проверете квотата и настройките.]';
    onChunk(fallback);
    onComplete(fullContent || fallback);
    throw error;
  }
};

export const extractProfileData = async (userId, transcript) => {
  try {
    const extractionPrompt = `You are a clinical data extraction engine. Review this transcript. Extract the user's data into a JSON object strictly matching this schema: 
{ 
  "financial_goals": "string",
  "family_context": "string", 
  "known_triggers": ["string"], 
  "hobbies": ["string"], 
  "entertainment_tools": [{"name": "string", "url": "string"}] 
}

For 'entertainment_tools', use your knowledge to auto-generate 2 or 3 real-world apps/websites (with standard URLs like YouTube, Duolingo) that match the user's hobbies.
Ensure all text values intended for the user, like tool descriptions, are in Bulgarian (Български език).
Return ONLY valid JSON without Markdown wrappers or extra text.

Transcript:
${transcript}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // using standard 4o for better JSON extraction reliability
      messages: [{ role: 'system', content: extractionPrompt }],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const extractionText = response.choices[0].message.content;
    const extractedData = JSON.parse(extractionText);

    // Update or create the AI Profile for the user
    await AIProfile.findOneAndUpdate(
      { userId },
      { $set: extractedData },
      { upsert: true, new: true }
    );

    console.log(`Successfully extracted and saved AI Profile for user ${userId}`);
    return extractedData;

  } catch (error) {
    console.error('Error extracting profile data:', error);
    // Don't throw, just log it, as this is a background task
  }
};
