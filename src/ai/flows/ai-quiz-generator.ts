
'use server';

/**
 * @fileOverview Generates custom quizzes from a topic or document using the Gemini API.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import { z } from 'zod';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic to generate a quiz for.'),
  difficulty: z
    .enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .describe('The difficulty level of the quiz.'),
  questionCount: z
    .number()
    .min(5)
    .max(50)
    .describe('The number of questions to generate.'),
  questionType: z
    .enum(['MCQ', 'True/False', 'Short Answer', 'Essay'])
    .describe('The type of questions to generate.'),
});

export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).optional().describe("An array of choices. This must be provided if the questionType is 'MCQ' or 'True/False'."),
      answer: z.string().describe('The correct answer to the quiz question. For MCQ and True/False, this must be one of the strings from the options array.'),
    })
  ).describe('An array of quiz questions and answers.'),
});

export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

import { callGroqChat } from '../groq';

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  const promptText = `You are an expert quiz generator. Your task is to create a quiz based on the following specifications. Please generate exactly the requested number of questions.

IMPORTANT JSON Structure Rules:
- For 'MCQ' (Multiple Choice Question) type, you MUST provide an 'options' array with 4 distinct choices. The 'answer' field MUST be one of the strings from the 'options' array.
- For 'True/False' type, you MUST provide an 'options' array with only two strings: 'True' and 'False'. The 'answer' field MUST be either 'True' or 'False'.
- For 'Short Answer' and 'Essay' types, you MUST generate an open-ended question that requires a text-based response. You MUST OMIT the 'options' field entirely. The 'answer' field should contain a concise, correct answer.

Specifications:
Topic: ${input.topic}
Difficulty: ${input.difficulty}
Number of Questions: ${input.questionCount}
Question Type: ${input.questionType}

You MUST return a JSON object matching this schema:
{
  "quiz": [
    {
      "question": "string",
      "options": ["string"], // omit or leave undefined for Short Answer/Essay
      "answer": "string"
    }
  ]
}
`;

  try {
    const responseText = await callGroqChat({
      messages: [
        { role: 'system', content: 'You are a professional quiz builder. You always output valid JSON matching the user schema instructions.' },
        { role: 'user', content: promptText }
      ],
      responseFormat: 'json_object'
    });

    return JSON.parse(responseText) as GenerateQuizOutput;
  } catch (error) {
    console.error("Error in Groq generateQuiz:", error);
    throw new Error(`Failed to generate quiz: ${(error as Error).message}`);
  }
}
