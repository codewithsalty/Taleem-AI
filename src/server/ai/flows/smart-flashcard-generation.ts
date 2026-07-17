'use server';
/**
 * @fileOverview Generates flashcards from uploaded notes or learning material.
 *
 * - generateFlashcards - A function that generates flashcards from provided text.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import { z } from 'zod';

const GenerateFlashcardsInputSchema = z.object({
  text: z
    .string()
    .describe(
      'The notes or learning material to generate flashcards from.'
    ),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(z.object({
    front: z.string().describe('The question or prompt on the front of the flashcard.'),
    back: z.string().describe('The answer or explanation on the back of the flashcard.'),
  })).describe('An array of flashcards generated from the input text.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

import { callGroqChat } from '../groq';

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  const promptText = `You are an expert educator who can create effective flashcards.

Generate a set of flashcards from the given text. Each flashcard should have a front (question/prompt) and a back (answer/explanation).
Return the flashcards as a JSON array of objects with "front" and "back" keys.

Text: ${input.text}

You MUST return a JSON object matching this schema:
{
  "flashcards": [
    {
      "front": "string",
      "back": "string"
    }
  ]
}
`;

  try {
    const responseText = await callGroqChat({
      messages: [
        { role: 'system', content: 'You are a professional flashcard generator. You always output valid JSON matching the user schema instructions.' },
        { role: 'user', content: promptText }
      ],
      responseFormat: 'json_object'
    });

    return JSON.parse(responseText) as GenerateFlashcardsOutput;
  } catch (error) {
    console.error("Error in Groq generateFlashcards:", error);
    throw new Error(`Failed to generate flashcards: ${(error as Error).message}`);
  }
}
