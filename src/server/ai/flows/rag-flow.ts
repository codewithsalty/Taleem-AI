'use server';

import { z } from 'zod';
import { RagOutput, RagOutputSchema, type CurriculumDocument } from '@/lib/types';
import { generateEmbedding } from './embedding-flow';
import { initializeFirebaseServer } from "@/server/firebase/server-init";
import { callGroqChat } from '../groq';

const RagInputSchema = z.object({
  question: z.string().describe('The user\'s question.'),
  isRagMode: z.boolean().describe('Whether to use the RAG pipeline or general knowledge.'),
  userId: z.string().optional().describe('The ID of the user to filter documents for.'),
  documents: z.array(z.object({
    id: z.string(),
    sourceName: z.string(),
    chunkNumber: z.number(),
    text: z.string(),
    embedding: z.array(z.number()).optional(),
    userId: z.string().optional(),
  })).optional().describe('Pre-fetched documents from the client. Used when server-side Firestore is unavailable.'),
});

export type RagInput = z.infer<typeof RagInputSchema>;

function cosineSimilarity(vecA: number[], vecB: number[]) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function fetchDocumentsFromFirestore(userId?: string): Promise<CurriculumDocument[]> {
  try {
    const admin = initializeFirebaseServer();
    const db = admin.firestore();
    let query: FirebaseFirestore.Query = db.collection('curriculum_documents');
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<CurriculumDocument, 'id'>),
    }));
  } catch (e) {
    console.warn('Firestore unavailable for RAG query:', e);
    return [];
  }
}

export async function generateRagResponse(input: RagInput): Promise<RagOutput> {
    if (!input.isRagMode) {
        try {
            const responseText = await callGroqChat({
                messages: [
                    { role: 'system', content: 'You are an expert AI Tutor named Taleem AI. Answer the user question accurately, briefly, and clearly.' },
                    { role: 'user', content: input.question }
                ]
            });
            return { chunks: [], finalAnswer: responseText };
        } catch (error) {
            console.error("Error in Groq generalRAG:", error);
            return { chunks: [], finalAnswer: "Sorry, I encountered an issue generating a response. Please try again." };
        }
    }

    let allChunks: CurriculumDocument[] = [];

    if (input.documents && input.documents.length > 0) {
      allChunks = input.documents;
    } else {
      allChunks = await fetchDocumentsFromFirestore(input.userId);
    }

    if (allChunks.length === 0) {
        return {
            chunks: [],
            finalAnswer: input.userId
                ? "You haven't uploaded any documents yet. Please upload a document to get started."
                : "The knowledge base is empty. Please upload some documents first.",
        };
    }

    const { embedding: queryEmbedding } = await generateEmbedding({ text: input.question });

    if (!queryEmbedding) {
        throw new Error("Failed to generate query embedding.");
    }

    const scoredChunks = allChunks.map(chunk => {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding || []);
        return { ...chunk, score };
    }).filter(chunk => chunk.score > 0.3);

    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 5);

    if (topChunks.length === 0) {
        return { chunks: [], finalAnswer: "I could not find any relevant information in your documents to answer your question." };
    }

    const context = topChunks.map(c => `Source: ${c.sourceName} (Chunk ${c.chunkNumber})\nText: ${c.text}`).join('\n\n');

    let finalAnswer = "I couldn't synthesize an answer from the retrieved documents.";
    try {
        const promptText = `You are Taleem AI. Answer the question based *only* on the provided context.

CRITICAL: Base your answer strictly on the provided context. Do NOT use outside knowledge. If the answer cannot be found, respond with: "Mujhe is topic ki maloomat nahi hai in uploaded documents mein."

CONTEXT:
---
${context}
---

QUESTION: ${input.question}

Your Answer:`;

        finalAnswer = await callGroqChat({
            messages: [
                { role: 'system', content: 'You are a professional educational tutor.' },
                { role: 'user', content: promptText }
            ]
        });
    } catch (error) {
        console.error("Error in Groq RAG answer:", error);
    }

    return {
      chunks: topChunks.map(c => ({
        source: `${c.sourceName} (Chunk ${c.chunkNumber})`,
        text: c.text,
        score: c.score
      })),
      finalAnswer,
    };
}
