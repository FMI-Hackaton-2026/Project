import OpenAI from 'openai';
import AIProfile from '../models/aiProfile.js';
import 'dotenv/config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates the next question in the onboarding flow based on the previous context.
 * 
 * @param {string} systemPromptContent - The instructions for the AI.
 * @param {Array} previousMessages - The last 5-10 messages from the database.
 * @param {string} userMessage - The latest message/answers from the user.
 * @returns {Promise<string>} - The AI's response/next question.
 */
export const generateOnboardingQuestion = async (
  systemPromptContent,
  previousMessages,
  userMessage
) => {
  // Assemble the dynamic memory array
  const messages = [
    { role: 'system', content: systemPromptContent },
    ...previousMessages.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
    temperature: 0.7, // A bit of warmth but mostly focused on the prompt instructions
  });

  return response.choices[0].message.content;
};

/**
 * Extracts the user's core motivations, hobbies, and triggers into a JSON structure.
 * 
 * @param {Array} transcript - The entire chat transcript.
 * @returns {Promise<Object>} - The extracted JSON profile data.
 */
export const extractProfileData = async (transcript) => {
  const extractionPrompt = `
You are a brilliant behavioral analyst. Your task is to extract specific profile details from the user's onboarding chat transcript.
You must output ONLY valid JSON matching the exact schema provided. Do not include markdown code blocks.
If you cannot determine a field, return an empty array for lists, or null for strings/numbers.

Target JSON Schema:
{
  "financial_goals": "string (summarized financial goal, e.g., 'Save for daughter's college') | null",
  "family_context": "string (summary of family situation, e.g., 'Married, two kids, feels distant') | null",
  "known_triggers": ["string"] (list of specific situations/feelings that trigger gambling, or empty array),
  "hobbies": ["string"] (list of positive hobbies/interests, or empty array),
  "resilience_score": "number (0-100 scale estimating how resilient they currently feel based on tone) | null"
}
`;

  const messages = [
    { role: 'system', content: extractionPrompt },
    ...transcript.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: 'Extract the core motivations, hobbies, and triggers from this transcript into the JSON format.' }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
    temperature: 0.2, // Low temp for more deterministic JSON output
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
};
