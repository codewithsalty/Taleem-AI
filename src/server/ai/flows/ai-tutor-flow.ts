'use server';

/**
 * @fileOverview A conversational AI tutor that uses provided document text to answer questions.
 * 
 * - generateTutorResponse - A function that generates a response from the AI tutor.
 * - AITutorInput - The input type for the generateTutorResponse function.
 * - AITutorOutput - The return type for the generateTutorResponse function.
 */

import { z } from 'zod';
import { callGroqChat } from '../groq';

const AITutorInputSchema = z.object({
  documentText: z.string().describe('The learning material or document provided by the user.'),
  userMessage: z.string().describe('The user\'s question or message to the tutor.'),
});

export type AITutorInput = z.infer<typeof AITutorInputSchema>;

const AITutorOutputSchema = z.object({
  assistantResponse: z.string().describe('The AI tutor\'s response to the user\'s message.'),
});

export type AITutorOutput = z.infer<typeof AITutorOutputSchema>;

export async function generateTutorResponse(input: AITutorInput): Promise<AITutorOutput> {
  const promptText = `You are a helpful AI Tutor named Taleem AI. Your task is to answer the student's question based *only* on the provided "DOCUMENT CONTEXT".

**CRITICAL RULES:**
1.  Base your answer strictly and exclusively on the information within the provided DOCUMENT CONTEXT.
2.  Do NOT use any outside knowledge.
3.  If the answer to the question cannot be found in the DOCUMENT CONTEXT, you MUST respond with exactly this phrase: "I'm sorry, but I cannot answer that question based on the document you provided. My knowledge is limited to the text you've given me."
4.  Keep your answer concise and to the point.

DOCUMENT CONTEXT:
---
${input.documentText}
---

STUDENT'S QUESTION: ${input.userMessage}

You MUST return a JSON object matching this schema:
{
  "assistantResponse": "string"
}
`;

  try {
    const responseText = await callGroqChat({
      messages: [
        { role: 'system', content: 'You are a helpful AI Tutor named Taleem AI. You always output valid JSON matching the user schema instructions.' },
        { role: 'user', content: promptText }
      ],
      responseFormat: 'json_object'
    });

    return JSON.parse(responseText) as AITutorOutput;
  } catch (error) {
    console.error("Error in Groq generateTutorResponse:", error);
    return {
      assistantResponse: "Sorry, I encountered an issue generating a response. Please try again.",
    };
  }
}
