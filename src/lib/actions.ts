'use server';

import { generateQuiz, type GenerateQuizInput, type GenerateQuizOutput } from '@/ai/flows/ai-quiz-generator';
import { generateFlashcards, type GenerateFlashcardsInput, type GenerateFlashcardsOutput } from '@/ai/flows/smart-flashcard-generation';
import { generateTutorResponse, type AITutorInput } from '@/ai/flows/ai-tutor-flow';
import { generateRagResponse, type RagInput } from '@/ai/flows/rag-flow';
import { generateStudySuite } from '@/ai/flows/smart-study-suite-flow';
import { type StudySuiteInput, type StudySuiteOutput } from '@/lib/types';
export type { StudySuiteOutput };
import { generateMindMap, type GenerateMindMapInput, type GenerateMindMapOutput } from '@/ai/flows/mind-map-generator';
import { generateNotes, type GenerateNotesInput } from '@/ai/flows/notes-generator-flow';
import { generatePresentation, type GeneratePresentationInput, type GeneratePresentationOutput } from '@/ai/flows/presentation-generator-flow';
import { identifyImportantQuestions, type IdentifyImportantQuestionsInput, type IdentifyImportantQuestionsOutput } from '@/ai/flows/identify-important-questions-flow';
import { generateYoutubeSummary, type GenerateYoutubeSummaryInput, type GenerateYoutubeSummaryOutput } from '@/ai/flows/youtube-summarizer-flow';
import { generateEmbedding } from '@/ai/flows/embedding-flow';
import { processDocument } from '@/ai/flows/document-processor-flow';
import { z } from 'zod';
import { type Message, type TutorFormState, type TutorContextFormState, type RagOutput, type RagFormState, type VoiceTutorOutput, type RagVoiceFormState, type StudySuiteFormState, type NotesFormState, type NotesOutput, type PresentationFormState, type ImportantQuestionsFormState, type YoutubeSummarizerFormState, type QuizResult } from './types';
export type { Message, TutorFormState, TutorContextFormState, RagOutput, RagFormState, VoiceTutorOutput, RagVoiceFormState, StudySuiteFormState, NotesFormState, NotesOutput, PresentationFormState, ImportantQuestionsFormState, YoutubeSummarizerFormState, QuizResult };
import { redirect } from 'next/navigation';
import { generateVoiceTutorResponse } from '@/ai/flows/voice-tutor-flow';


const quizSchema = z.object({
    topic: z.string().min(3, { message: 'Please enter a topic with at least 3 characters.' }),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
    questionCount: z.coerce.number().min(5).max(20),
    questionType: z.enum(['MCQ', 'True/False', 'Short Answer', 'Essay']),
});

export type QuizFormState = {
    message: string;
    errors?: {
        topic?: string[];
        difficulty?: string[];
        questionCount?: string[];
        questionType?: string[];
    };
    quiz?: GenerateQuizOutput['quiz'];
    topic?: string;
};

export async function generateQuizAction(
    prevState: QuizFormState,
    formData: FormData
): Promise<QuizFormState> {
    const validatedFields = quizSchema.safeParse({
        topic: formData.get('topic'),
        difficulty: formData.get('difficulty'),
        questionCount: formData.get('questionCount'),
        questionType: formData.get('questionType'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Please check your inputs and try again.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const input: GenerateQuizInput = validatedFields.data;
        const result = await generateQuiz(input);

        if (!result || !result.quiz || result.quiz.length === 0) {
             return {
                message: "Couldn't generate quiz. The AI had trouble with this topic. Please try a different or simpler topic.",
                errors: {},
            };
        }

        return { message: 'Quiz generated successfully!', quiz: result.quiz, topic: validatedFields.data.topic };
    } catch (error) {
        console.error("Error in generateQuizAction:", error);
        return {
            message: 'An unexpected response was received from the server.',
            errors: {},
        };
    }
}


const flashcardSchema = z.object({
  text: z.string().min(50, { message: 'Please provide at least 50 characters of text to generate meaningful flashcards.' }),
});

export type FlashcardFormState = {
    message: string;
    errors?: {
        text?: string[];
    };
    flashcards?: GenerateFlashcardsOutput['flashcards'];
};


export async function generateFlashcardsAction(
    prevState: FlashcardFormState,
    formData: FormData
): Promise<FlashcardFormState> {
    const validatedFields = flashcardSchema.safeParse({
        text: formData.get('text'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Please check your input and try again.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const input: GenerateFlashcardsInput = validatedFields.data;
        const result = await generateFlashcards(input);

        if (!result || !result.flashcards || result.flashcards.length === 0) {
            return {
              message: 'The AI could not generate flashcards from this text. Please try different content.',
              errors: {},
            };
        }

        return { message: 'Flashcards generated successfully!', flashcards: result.flashcards };
    } catch (error) {
        console.error("Error in generateFlashcardsAction:", error);
        return {
            message: 'An unexpected error occurred while generating flashcards. Please try again later.',
            errors: {},
        };
    }
}

const tutorSchema = z.object({
  userMessage: z.string().min(1, { message: 'Please enter a question or message.' }),
  documentText: z.string().optional(),
  userId: z.string().optional(),
});

export async function generateTutorResponseAction(
  prevState: TutorFormState,
  formData: FormData
): Promise<TutorFormState> {
  const validatedFields = tutorSchema.safeParse({
    userMessage: formData.get('userMessage'),
    documentText: formData.get('documentText'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      message: 'Validation failed. Please provide a message.',
      errors: fieldErrors,
      role: 'error',
    };
  }

  try {
      const documentText = validatedFields.data.documentText;
      const userId = validatedFields.data.userId || 'anonymous';

      if (documentText === 'rag_mode_enabled') {
          const ragResult = await generateRagResponse({
              question: validatedFields.data.userMessage,
              isRagMode: true,
              userId: userId,
          });
          return { message: 'Response generated.', role: 'assistant', content: ragResult.finalAnswer };
      }

      const ragResult = await generateRagResponse({
          question: validatedFields.data.userMessage,
          isRagMode: false,
      });
      return { message: 'Response generated.', role: 'assistant', content: ragResult.finalAnswer };

  } catch (error) {
      console.error("Error in generateTutorResponseAction:", error);
      return { message: 'An unexpected error occurred while generating the tutor response.', role: 'error' };
  }
}

const tutorContextSchema = z.object({
  text: z.string().optional(),
  file: z.any().optional(),
  userId: z.string().optional(),
}).refine(data => {
  const hasText = data.text && data.text.trim().length > 0;
  const hasFile = data.file && (data.file instanceof File) && data.file.size > 0;
  return hasText || hasFile;
}, {
  message: 'Please either paste text or upload a file.',
  path: ['text'],
});

async function fileToDataURI(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function generateTutorContextAction(
  prevState: TutorContextFormState,
  formData: FormData
): Promise<TutorContextFormState> {
    const validatedFields = tutorContextSchema.safeParse({
        text: formData.get('text'),
        file: formData.get('file'),
        userId: formData.get('userId'),
    });

    if (!validatedFields.success) {
        return {
            message: "Validation failed. Please provide content.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { text, file, userId } = validatedFields.data;
    const userIdVal = userId || 'anonymous';
    const sourceName = file && file instanceof File && file.size > 0 ? file.name : 'pasted_text';

    let chunks: string[] = [];

    try {
        const dataUri = file && file instanceof File && file.size > 0 ? await fileToDataURI(file) : undefined;
        const result = await processDocument({ dataUri, text });
        chunks = result.chunks;
    } catch (error) {
        console.error("Error processing document in generateTutorContextAction:", error);
        return { message: `Failed to process the uploaded material: ${(error as Error).message}` };
    }

    if (!chunks || chunks.length === 0) {
        return { message: "Could not extract any content from the provided source." };
    }

    try {
        const embeddings = await Promise.all(
          chunks.map(chunk => generateEmbedding({ text: chunk }))
        );

        try {
          const admin = (await import('@/firebase/server-init')).initializeFirebaseServer();
          const db = admin.firestore();
          const docsCol = db.collection('curriculum_documents');

          const snapshot = await docsCol.where('userId', '==', userIdVal).get();
          const batch = db.batch();
          snapshot.docs.forEach(docSnap => {
            batch.delete(docSnap.ref);
          });
          await batch.commit();

          for (let i = 0; i < chunks.length; i++) {
            await docsCol.add({
              userId: userIdVal,
              sourceName,
              chunkNumber: i + 1,
              text: chunks[i],
              embedding: embeddings[i].embedding || [],
              createdAt: new Date().toISOString(),
            });
          }
        } catch (firestoreError) {
          console.warn('Firestore unavailable for indexing. Embeddings generated but not persisted.', firestoreError);
        }

        return { message: 'Context indexed successfully.', documentText: 'rag_mode_enabled' };
    } catch (error) {
        console.error("Error indexing chunks in generateTutorContextAction:", error);
        return { message: `Failed to index document in knowledge base: ${(error as Error).message}` };
    }
}


const ragSchema = z.object({
  question: z.string().min(3, { message: 'Please enter a question with at least 3 characters.' }),
  isRagMode: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
  userId: z.string().optional(),
});

export async function generateRagResponseAction(
    prevState: RagFormState,
    formData: FormData
): Promise<RagFormState> {
    const validatedFields = ragSchema.safeParse({
        question: formData.get('question'),
        isRagMode: formData.get('isRagMode'),
        userId: formData.get('userId'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Please check your inputs and try again.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const input: RagInput = validatedFields.data;
        const result = await generateRagResponse(input);

        if (!result || !result.finalAnswer) {
            return {
                message: 'The AI could not generate a response. Please try again.',
                errors: {},
            };
        }

        return { message: 'RAG response generated successfully!', ragResponse: result };
    } catch (error) {
        console.error("Error in generateRagResponseAction:", error);
        return {
            message: `An unexpected error occurred: ${(error as Error).message}`,
            errors: {},
        };
    }
}


export async function generateVoiceTutorResponseAction(
    prevState: RagVoiceFormState,
    formData: FormData
): Promise<VoiceTutorOutput> {
    const validatedFields = z.object({
        audioDataUri: z.string().min(1, { message: 'Audio data is missing.' }),
        language: z.enum(['en', 'ur']),
        documentText: z.string().optional(),
    }).safeParse({
        audioDataUri: formData.get('audioDataUri'),
        language: formData.get('language'),
        documentText: formData.get('documentText')
    });

    if (!validatedFields.success) {
        throw new Error('Invalid input for voice tutor action.');
    }

    try {
        const result = await generateVoiceTutorResponse(validatedFields.data);
        return result;
    } catch (e: any) {
        console.error('Error in generateVoiceTutorResponseAction:', e);
        throw new Error(`An unexpected error occurred: ${e.message}`);
    }
}


export async function logoutAction() {
    redirect('/login');
}

export type MindMapFormState = {
    message: string;
    errors?: {
        text?: string[];
    };
    mermaidGraph?: GenerateMindMapOutput['mermaidGraph'];
};

const mindMapSchema = z.object({
  text: z.string().min(50, { message: 'Please provide at least 50 characters of text to generate a mind map.' }),
});

export async function generateMindMapAction(
    prevState: MindMapFormState,
    formData: FormData
): Promise<MindMapFormState> {
    const validatedFields = mindMapSchema.safeParse({
        text: formData.get('text'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Please check your input and try again.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const input: GenerateMindMapInput = validatedFields.data;
        const result = await generateMindMap(input);

        if (!result || !result.mermaidGraph) {
            return {
              message: 'The AI could not generate a mind map from this text. Please try different content.',
              errors: {},
            };
        }

        return { message: 'Mind map generated successfully!', mermaidGraph: result.mermaidGraph };
    } catch (error) {
        console.error("Error in generateMindMapAction:", error);
        return {
            message: 'An unexpected error occurred while generating the mind map. Please try again later.',
            errors: {},
        };
    }
}

const notesSchema = z.object({
  text: z.string().optional(),
  file: z.instanceof(File).optional(),
  prompt: z.string().optional(),
  includeDiagram: z.preprocess((val) => val === 'on' || val === true, z.boolean().optional()),
  includeConceptMap: z.preprocess((val) => val === 'on' || val === true, z.boolean().optional()),
  language: z.preprocess((val) => val === 'on' ? 'ur' : 'en', z.enum(['en', 'ur'])).optional(),
}).refine(data => data.text || (data.file && data.file.size > 0), {
  message: 'Please either paste text or upload a file.',
  path: ['text'],
});


export async function generateNotesAction(
  prevState: NotesFormState,
  formData: FormData
): Promise<NotesFormState> {
    const validatedFields = notesSchema.safeParse({
        text: formData.get('text'),
        file: formData.get('file'),
        prompt: formData.get('prompt'),
        includeDiagram: formData.get('includeDiagram'),
        includeConceptMap: formData.get('includeConceptMap'),
        language: formData.get('language'),
    });

    if (!validatedFields.success) {
        return {
            message: "Input validation failed. Please provide content.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const { text, file, prompt, includeDiagram, includeConceptMap, language } = validatedFields.data;

        let dataUri: string | undefined;
        let contentToProcess = text;

        if (file && file.size > 0) {
            dataUri = await fileToDataURI(file);
            contentToProcess = undefined;
        }

        if (!contentToProcess && !dataUri) {
             return { message: "Please provide content to generate notes." };
        }

        const notesInput: GenerateNotesInput = { text: contentToProcess, dataUri, prompt, includeDiagram, includeConceptMap, language };
        const notesResult = await generateNotes(notesInput);

        if (!notesResult || !notesResult.title) {
            return { message: "The AI could not generate notes from the provided content." };
        }

        return { message: "Notes generated successfully!", notes: notesResult };

    } catch (error: any) {
        console.error("Error in generateNotesAction:", error);
        return { message: `An unexpected error occurred: ${error.message}` };
    }
}


import { dailyChallengeDefs } from './gamification';

export async function ensureDailyChallenges(userId: string) {
    try {
      const admin = (await import('@/firebase/server-init')).initializeFirebaseServer();
      const db = admin.firestore();
      const challengesRef = db.collection('users').doc(userId).collection('daily_challenges');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = admin.firestore.Timestamp.fromDate(today);

      const existing = await challengesRef.where('expiresAt', '>=', todayTimestamp).get();

      if (existing.empty) {
          const batch = db.batch();
          const expiresAt = new Date();
          expiresAt.setHours(23, 59, 59, 999);

          const selected = [...dailyChallengeDefs].sort(() => 0.5 - Math.random()).slice(0, 3);

          selected.forEach(challengeDef => {
              const ref = challengesRef.doc();
              batch.set(ref, {
                  challengeId: challengeDef.id,
                  title: challengeDef.title,
                  description: challengeDef.description,
                  progress: 0,
                  goal: challengeDef.id.includes('quiz') ? 2 : (challengeDef.id.includes('flashcard') ? 20 : (challengeDef.id.includes('voice') ? 3 : (challengeDef.id.includes('subject') ? 3 : 1))),
                  completed: false,
                  expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
              });
          });

          await batch.commit();
      }
    } catch (e) {
      console.warn('Daily challenges unavailable (Firester not configured):', e);
    }
}


const studySuiteFormSchema = z.object({
  text: z.string().optional(),
  file: z.instanceof(File).optional(),
  subject: z.string().optional(),
  grade: z.string().optional(),
  chapter: z.string().optional(),
  generate_guide: z.preprocess(v => v === 'on', z.boolean()).optional(),
  generate_audio: z.preprocess(v => v === 'on', z.boolean()).optional(),
  generate_map: z.preprocess(v => v === 'on', z.boolean()).optional(),
  generate_flashcards: z.preprocess(v => v === 'on', z.boolean()).optional(),
  generate_quiz: z.preprocess(v => v === 'on', z.boolean()).optional(),
}).refine(data => data.text || (data.file && data.file.size > 0), {
  message: 'Please either paste text or upload a file.',
  path: ['text'],
});

export async function generateStudySuiteAction(
  prevState: StudySuiteFormState,
  formData: FormData
): Promise<StudySuiteFormState> {

    const rawFormData = {
        text: formData.get('text'),
        file: formData.get('file'),
        subject: formData.get('subject'),
        grade: formData.get('grade'),
        chapter: formData.get('chapter'),
        generate_guide: formData.get('generate.guide'),
        generate_audio: formData.get('generate.audio'),
        generate_map: formData.get('generate.map'),
        generate_flashcards: formData.get('generate.flashcards'),
        generate_quiz: formData.get('generate.quiz'),
    };

    const validatedFields = studySuiteFormSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
        return {
            message: "Input validation failed. Please provide content.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { file, text, ...rest } = validatedFields.data;
    let content = text;

    if (file && file.size > 0) {
        try {
            const fileText = await file.text();
            content = (text ? text + '\n\n' : '') + fileText;
        } catch (e) {
            return { message: 'Could not read the uploaded file.', errors: {} };
        }
    }

    if (!content) {
         return { message: 'Please provide content to generate study materials.', errors: { text: ["Content is required."] } };
    }

    const input: StudySuiteInput = {
        text: content,
        subject: validatedFields.data.subject,
        generate: {
            guide: validatedFields.data.generate_guide,
            audio: validatedFields.data.generate_audio,
            map: validatedFields.data.generate_map,
            flashcards: validatedFields.data.generate_flashcards,
            quiz: validatedFields.data.generate_quiz,
        }
    };

    try {
        const result: StudySuiteOutput = await generateStudySuite(input);
        return { message: 'Study suite generated successfully!', output: result };
    } catch (error: any) {
        return { message: `An error occurred: ${error.message}`, errors: {} };
    }
}


const presentationSchema = z.object({
  topic: z.string().optional(),
  text: z.string().optional(),
  file: z.instanceof(File).optional(),
}).refine(data => {
  const hasText = data.text && data.text.trim().length > 0;
  const hasFile = data.file && data.file.size > 0;
  const hasTopic = data.topic && data.topic.trim().length > 0;
  return hasText || hasFile || hasTopic;
}, {
  message: 'Please provide a topic, some text, or upload a file.',
  path: ['text'],
});


export async function generatePresentationAction(
  prevState: PresentationFormState,
  formData: FormData
): Promise<PresentationFormState> {
    const validatedFields = presentationSchema.safeParse({
        text: formData.get('text'),
        file: formData.get('file'),
        topic: formData.get('topic'),
    });

    if (!validatedFields.success) {
        return {
            message: "Validation failed. Please provide content.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { text, file, topic } = validatedFields.data;

    let contentToProcess: string | undefined = text && text.trim().length > 0 ? text : undefined;
    let dataUri: string | undefined;

    if (file && file.size > 0) {
        try {
            dataUri = await fileToDataURI(file);
        } catch (error) {
            console.error("Error processing file in generatePresentationAction:", error);
            return { message: "Failed to process the uploaded file." };
        }
    }

    if (dataUri) {
         try {
            const { chunks } = await processDocument({ dataUri });
            contentToProcess = chunks.join('\n\n');
        } catch (error) {
            console.error("Error extracting text from file in generatePresentationAction:", error);
            return { message: "Failed to extract text from the uploaded file." };
        }
    }

    const hasTopic = topic && topic.trim().length > 0;
    if (!contentToProcess && !hasTopic) {
        return { message: "Please provide a topic or some text content." };
    }

    try {
        const result = await generatePresentation({ text: contentToProcess, topic });
        if (!result || !result.slides) {
            return { message: "The AI could not generate a presentation from the provided content." };
        }
        return { message: 'Presentation generated successfully!', presentation: result };
    } catch (error) {
        console.error("Error in generatePresentationAction:", error);
        return { message: `An unexpected error occurred: ${(error as Error).message}` };
    }
}

const importantQuestionsSchema = z.object({
    questions: z.array(z.string()),
});

export async function identifyImportantQuestionsAction(
    prevState: ImportantQuestionsFormState,
    formData: FormData
): Promise<ImportantQuestionsFormState> {

    const questions = formData.getAll('questions') as string[];

    const validatedFields = importantQuestionsSchema.safeParse({ questions });

    if (!validatedFields.success) {
        return {
            message: 'Input validation failed.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const input: IdentifyImportantQuestionsInput = validatedFields.data;
        const result = await identifyImportantQuestions(input);

        if (!result || !result.importantTopics) {
             return {
                message: "Couldn't identify important topics. Please try again.",
                errors: {},
            };
        }

        return { message: 'Analysis complete!', importantTopics: result.importantTopics };
    } catch (error) {
        console.error("Error in identifyImportantQuestionsAction:", error);
        return {
            message: 'An unexpected error occurred during analysis. Please try again later.',
            errors: {},
        };
    }
}


const youtubeSummarizerSchema = z.object({
  videoUrl: z.string().url({ message: "Please enter a valid YouTube URL." }),
});

export async function generateYoutubeSummaryAction(
  prevState: YoutubeSummarizerFormState,
  formData: FormData
): Promise<YoutubeSummarizerFormState> {
  const validatedFields = youtubeSummarizerSchema.safeParse({
    videoUrl: formData.get('videoUrl'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const input: GenerateYoutubeSummaryInput = validatedFields.data;
    const result = await generateYoutubeSummary(input);
    return { message: 'Summary generated successfully!', summary: result.summary };
  } catch (error) {
    console.error("Error in generateYoutubeSummaryAction:", error);
    return {
      message: (error as Error).message || 'An unexpected error occurred. Please check the URL and try again.',
      errors: {},
    };
  }
}
