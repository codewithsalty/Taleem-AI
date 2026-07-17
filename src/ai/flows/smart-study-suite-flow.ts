
'use server';

/**
 * @fileOverview A comprehensive flow that generates multiple study assets from a single text input.
 *
 * - generateStudySuite - A function that orchestrates the generation of study guides, quizzes, flashcards, etc.
 */

import { z } from 'zod';
import { generateQuiz, type GenerateQuizInput } from './ai-quiz-generator';
import { generateFlashcards, type GenerateFlashcardsInput } from './smart-flashcard-generation';
import { StudySuiteInputSchema, StudySuiteOutputSchema, StudySuiteInput, StudySuiteOutput, StudyGuideSchema, AudioLessonSchema, ConceptMapSchema } from '@/lib/types';
import { callGroqChat } from '../groq';

async function generateStudyGuideGroq(text: string) {
  const promptText = `You are an expert educator. Create a comprehensive study guide from the following text. The guide must include a summary, a list of key points, and a few practice questions with their answers.

Text:
${text}

You MUST return a JSON object matching this schema:
{
  "summary": "string",
  "keyPoints": ["string"],
  "practiceQuestions": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}
`;

  try {
    const res = await callGroqChat({
      messages: [
        { role: 'system', content: 'You are a professional study guide planner. You always output valid JSON.' },
        { role: 'user', content: promptText }
      ],
      responseFormat: 'json_object'
    });
    return JSON.parse(res);
  } catch (error) {
    console.error("Error generating guide via Groq:", error);
    return {
      summary: "Failed to generate guide summary.",
      keyPoints: [],
      practiceQuestions: []
    };
  }
}

async function generateAudioLessonGroq(text: string) {
  const promptText = `You are a scriptwriter for educational content. Create a conversational, two-voice audio lesson script (between a "Tutor" and a "Student") that explains the provided text. The script should be engaging and easy to understand.

Text:
${text}

You MUST return a JSON object matching this schema:
{
  "title": "string",
  "script": [
    {
      "speaker": "Tutor" | "Student",
      "dialogue": "string"
    }
  ]
}
`;

  try {
    const res = await callGroqChat({
      messages: [
        { role: 'system', content: 'You are an educational audio scriptwriter. You always output valid JSON.' },
        { role: 'user', content: promptText }
      ],
      responseFormat: 'json_object'
    });
    return JSON.parse(res);
  } catch (error) {
    console.error("Error generating audio script via Groq:", error);
    return {
      title: "Audio Lesson",
      script: []
    };
  }
}

async function generateConceptMapGroq(text: string) {
  const promptText = `You are an expert in visual learning. Create a MermaidJS concept map from the following text. The graph should show the key concepts and their relationships using a 'graph TD' layout.

Text:
${text}

You MUST return a JSON object matching this schema:
{
  "mermaidGraph": "string"
}
`;

  try {
    const res = await callGroqChat({
      messages: [
        { role: 'system', content: 'You are a concept map visual designer. You always output valid JSON.' },
        { role: 'user', content: promptText }
      ],
      responseFormat: 'json_object'
    });
    return JSON.parse(res);
  } catch (error) {
    console.error("Error generating concept map via Groq:", error);
    return {
      mermaidGraph: "graph TD\n    A[Error] --> B[Could not generate concept map]"
    };
  }
}

export async function generateStudySuite(input: StudySuiteInput): Promise<StudySuiteOutput> {
  const promises: { [K in keyof StudySuiteOutput]?: Promise<any> } = {};
  const content = input.text;

  if (input.generate.guide) {
    promises.guide = generateStudyGuideGroq(content);
  }
  if (input.generate.audio) {
    promises.audio = generateAudioLessonGroq(content);
  }
  if (input.generate.map) {
    promises.map = generateConceptMapGroq(content);
  }
  if (input.generate.flashcards) {
    const flashcardInput: GenerateFlashcardsInput = { text: content };
    promises.flashcards = generateFlashcards(flashcardInput).then(r => r.flashcards);
  }
  if (input.generate.quiz) {
    const quizInput: GenerateQuizInput = {
      topic: `The content provided, focusing on ${input.subject || 'the main concepts'}. The content is: ${content}`,
      difficulty: 'Intermediate',
      questionCount: 10,
      questionType: 'MCQ',
    };
    promises.quiz = generateQuiz(quizInput).then(r => r.quiz);
  }

  const results = await Promise.all(Object.values(promises));
  const keys = Object.keys(promises);

  const output: StudySuiteOutput = {};
  for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as keyof StudySuiteOutput;
      output[key] = results[i];
  }
  
  return output;
}
