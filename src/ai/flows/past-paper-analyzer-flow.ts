
'use server';
/**
 * @fileOverview Analyzes uploaded past exam papers.
 *
 * - analyzePastPaper - A function that analyzes a paper and extracts its structure and questions.
 * - AnalyzePastPaperInput - The input type for the analyzePastPaper function.
 * - AnalyzePastPaperOutput - The return type for the analyzePastPaper function.
 */

import { z } from 'zod';

const QuestionSchema = z.object({
  questionText: z.string().describe("The full text of the question."),
  marks: z.number().optional().describe("The number of marks the question is worth."),
  questionType: z.enum(['MCQ', 'Short Answer', 'Long Answer', 'Essay']).describe("The type of question."),
});

const PaperSectionSchema = z.object({
  sectionTitle: z.string().describe("The title of the section (e.g., 'Section A - Multiple Choice')."),
  questions: z.array(QuestionSchema).describe("An array of questions found in this section."),
});

const AnalyzePastPaperInputSchema = z.object({
  dataUri: z.string().describe(
    "A past paper document (e.g., PDF) as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type AnalyzePastPaperInput = z.infer<typeof AnalyzePastPaperInputSchema>;

const AnalyzePastPaperOutputSchema = z.object({
  subject: z.string().describe("The subject of the exam paper (e.g., 'Physics')."),
  year: z.number().optional().describe("The year the exam paper is from."),
  sections: z.array(PaperSectionSchema).describe("An array of sections that make up the paper."),
});
export type AnalyzePastPaperOutput = z.infer<typeof AnalyzePastPaperOutputSchema>;

import { processDocument } from './document-processor-flow';
import { callGroqChat } from '../groq';

export async function analyzePastPaper(input: AnalyzePastPaperInput): Promise<AnalyzePastPaperOutput> {
  // 1. Extract text from the PDF using document processor
  let documentText = '';
  try {
    const { chunks } = await processDocument({ dataUri: input.dataUri });
    documentText = chunks.join('\n\n');
  } catch (error) {
    console.error("Failed to parse PDF past paper:", error);
    throw new Error(`Failed to read the past paper file: ${(error as Error).message}`);
  }

  // 2. Perform structure extraction using Groq
  const promptText = `You are an expert at analyzing and structuring academic exam papers. Your task is to carefully examine the provided exam paper content and extract its structure, subject, year, and all questions into a clean JSON format.

**CRITICAL Instructions:**
1.  **Identify Subject and Year:** Determine the main subject and the year of the exam paper.
2.  **Extract Sections:** Break down the paper into its logical sections (e.g., Section A, Section B).
3.  **Extract Questions:** For each section, meticulously extract every question.
    -   Identify the full \`questionText\`.
    -   Determine the \`marks\` allocated if mentioned.
    -   Categorize the \`questionType\` as 'MCQ', 'Short Answer', 'Long Answer', or 'Essay'.

Exam Paper Content:
---
${documentText.substring(0, 8000)}
---

You MUST return a JSON object matching this schema:
{
  "subject": "string",
  "year": 0, // number, optional
  "sections": [
    {
      "sectionTitle": "string",
      "questions": [
        {
          "questionText": "string",
          "marks": 0, // number, optional
          "questionType": "MCQ" // can be MCQ, Short Answer, Long Answer, or Essay
        }
      ]
    }
  ]
}
`;

  try {
    const responseText = await callGroqChat({
      messages: [
        { role: 'system', content: 'You are an academic exam analyzer. You always output valid JSON.' },
        { role: 'user', content: promptText }
      ],
      responseFormat: 'json_object'
    });

    return JSON.parse(responseText) as AnalyzePastPaperOutput;
  } catch (error) {
    console.error("Error in Groq analyzePastPaper:", error);
    throw new Error(`Failed to analyze past paper: ${(error as Error).message}`);
  }
}
