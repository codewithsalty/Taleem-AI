'use server';

import { z } from 'zod';
import { VoiceTutorOutput, VoiceTutorOutputSchema } from '@/lib/types';
import { callGroqChat, transcribeAudio } from '../groq';

const VoiceTutorInputSchema = z.object({
  audioDataUri: z.string().describe("The user's spoken question as an audio data URI."),
  language: z.enum(['en', 'ur']).default('en').describe('The language for the response.'),
  documentText: z.string().optional().describe('Optional learning material to use as context for a RAG-based response.'),
});

export type VoiceTutorInput = z.infer<typeof VoiceTutorInputSchema>;

export async function generateVoiceTutorResponse(input: VoiceTutorInput): Promise<VoiceTutorOutput> {
  const languageLabel = input.language === 'ur' ? 'Urdu' : 'English';

  const transcribedQuestion = await transcribeAudio(input.audioDataUri, input.language === 'ur' ? 'ur' : 'en');

  let assistantResponse = '';

  const tutorPromptText = input.documentText
      ? `You are a helpful AI tutor. You MUST answer the question based *only* on the following document context. Keep your answer to 1-2 sentences. If the answer is not in the context, say so clearly. Respond in ${languageLabel}.

      DOCUMENT CONTEXT:
      ---
      ${input.documentText}
      ---

      User's question: ${transcribedQuestion}

      Your brief response:`
      : `You are a friendly AI Tutor for students. Answer the following question clearly. Keep your answer to 1-2 sentences. Respond in ${languageLabel}.

      Question: ${transcribedQuestion}`;

  try {
      assistantResponse = await callGroqChat({
          messages: [
              { role: 'system', content: 'You are a friendly and knowledgeable AI Tutor.' },
              { role: 'user', content: tutorPromptText }
          ]
      });
  } catch (error) {
      console.error("Groq assistant response failed:", error);
      assistantResponse = input.language === 'ur'
          ? "معذرت، میں ابھی جواب پیدا نہیں کر سکا۔"
          : "I'm sorry, I encountered an issue generating a response. Please try again.";
  }

  return {
    transcribedQuestion,
    assistantResponse,
    audioData: '',
    chunks: []
  };
}
