'use server';

/**
 * @fileOverview A function for generating embeddings for text content using Groq's nomic-embed-text-v1.5 model.
 * 
 * - generateEmbedding - A function that generates an embedding for a given text.
 */

import { z } from 'zod';

const GenerateEmbeddingInputSchema = z.object({
    text: z.string().describe('The text content to generate an embedding for.'),
});

export type GenerateEmbeddingInput = z.infer<typeof GenerateEmbeddingInputSchema>;

const GenerateEmbeddingOutputSchema = z.object({
    embedding: z.array(z.number()).describe('The 768-dimensional embedding vector.'),
});

export type GenerateEmbeddingOutput = z.infer<typeof GenerateEmbeddingOutputSchema>;

export async function generateEmbedding(input: GenerateEmbeddingInput): Promise<GenerateEmbeddingOutput> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not defined in environment variables.");
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'nomic-embed-text-v1.5',
                input: input.text,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq Embeddings API call failed: ${response.status} ${response.statusText} - ${errText}`);
        }

        const data = await response.json();
        const embedding = data.data?.[0]?.embedding;

        if (!embedding || !Array.isArray(embedding)) {
            throw new Error("No embedding vector returned in the response data.");
        }

        return {
            embedding,
        };
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw new Error(`Failed to generate embedding: ${(error as Error).message}`);
    }
}
