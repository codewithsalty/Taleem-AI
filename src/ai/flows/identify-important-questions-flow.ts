'use server';
/**
 * @fileOverview Analyzes a list of questions to identify recurring themes and their frequency.
 *
 * - identifyImportantQuestions - A function that analyzes questions and returns important topics.
 * - IdentifyImportantQuestionsInput - The input type for the function.
 * - IdentifyImportantQuestionsOutput - The return type for the function.
 */

import { z } from 'zod';

const ImportantTopicSchema = z.object({
  topic: z.string().describe("A concise name for the recurring topic or theme (e.g., 'Causes of the 1857 War of Independence')."),
  frequency: z.number().describe("The number of times this topic appeared in the provided questions."),
  relatedQuestions: z.array(z.string()).describe("The original questions that were grouped under this topic."),
});

const IdentifyImportantQuestionsInputSchema = z.object({
  questions: z.array(z.string()).describe("An array of all question texts extracted from multiple past papers."),
});
export type IdentifyImportantQuestionsInput = z.infer<typeof IdentifyImportantQuestionsInputSchema>;

const IdentifyImportantQuestionsOutputSchema = z.object({
  importantTopics: z.array(ImportantTopicSchema).describe("An array of identified important topics, sorted by frequency in descending order."),
});
export type IdentifyImportantQuestionsOutput = z.infer<typeof IdentifyImportantQuestionsOutputSchema>;


import { callGroqChat } from '../groq';

export async function identifyImportantQuestions(input: IdentifyImportantQuestionsInput): Promise<IdentifyImportantQuestionsOutput> {
  if (input.questions.length === 0) {
    return { importantTopics: [] };
  }

  const promptText = `You are an expert academic analyst. Your task is to analyze a list of questions from various past papers and identify the most frequently recurring topics.

**CRITICAL Instructions for Speed and Accuracy:**
1.  **Work Efficiently:** Your primary goal is to return a valid, structured JSON output as quickly as possible. Do not add any conversational text or explanations.
2.  **Group Similar Questions:** Read all the questions and group them based on the underlying concept or topic they are asking about. Small variations in wording should be ignored if the core topic is the same.
3.  **Create a Topic Name:** For each group, create a short, descriptive \`topic\` name that summarizes the main theme.
4.  **Count Frequency:** Count how many original questions fall under each topic to determine the \`frequency\`.
5.  **List Related Questions:** Include the full text of the original questions in the \`relatedQuestions\` array for each topic.
6.  **Sort by Frequency:** The final \`importantTopics\` array MUST be sorted with the most frequent topic first.

**List of Questions to Analyze:**
---
${input.questions.map(q => `- ${q}`).join('\n')}
---

You MUST return a JSON object matching this schema:
{
  "importantTopics": [
    {
      "topic": "string",
      "frequency": 0,
      "relatedQuestions": ["string"]
    }
  ]
}
`;

  try {
    const responseText = await callGroqChat({
      messages: [
        { role: 'system', content: 'You are an academic questions analyst. You always output valid JSON matching the user schema instructions.' },
        { role: 'user', content: promptText }
      ],
      responseFormat: 'json_object'
    });

    return JSON.parse(responseText) as IdentifyImportantQuestionsOutput;
  } catch (error) {
    console.error("Error in Groq identifyImportantQuestions:", error);
    throw new Error(`Failed to identify important questions: ${(error as Error).message}`);
  }
}
