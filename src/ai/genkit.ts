import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

let aiInstance: ReturnType<typeof genkit>;

if (apiKey) {
  aiInstance = genkit({
    plugins: [googleAI({ apiKey })],
    model: 'googleai/gemini-2.5-flash',
  });
} else {
  aiInstance = genkit({
    model: 'googleai/gemini-2.5-flash',
  });
}

export const ai = aiInstance;
