
'use server';
/**
 * @fileOverview Generates a summary for a given YouTube video URL.
 *
 * - generateYoutubeSummary - A function that handles the video summarization process.
 * - GenerateYoutubeSummaryInput - The input type for the function.
 * - GenerateYoutubeSummaryOutput - The return type for the function.
 */

import { z } from 'zod';
import { YoutubeTranscript } from 'youtube-transcript';
import { getVideoTranscript } from './video-to-text-flow';
import { callGroqChat } from '../groq';


const GenerateYoutubeSummaryInputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the YouTube video to summarize.'),
});
export type GenerateYoutubeSummaryInput = z.infer<typeof GenerateYoutubeSummaryInputSchema>;

const GenerateYoutubeSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the video content.'),
});
export type GenerateYoutubeSummaryOutput = z.infer<typeof GenerateYoutubeSummaryOutputSchema>;

export async function generateYoutubeSummary(input: GenerateYoutubeSummaryInput): Promise<GenerateYoutubeSummaryOutput> {
  let transcriptText = '';

  try {
    // First, try the fast method — youtube-transcript library
    const transcript = await YoutubeTranscript.fetchTranscript(input.videoUrl);
    transcriptText = transcript.map(t => t.text).join(' ');

    if (!transcriptText || transcriptText.trim() === '') {
      throw new Error("Transcript was empty, trying fallback.");
    }
  } catch (error: any) {
    console.warn("Primary transcript fetch failed, trying AI fallback:", error.message);
    // If the primary method fails, use the AI-based fallback
    try {
      const { transcript: aiTranscript } = await getVideoTranscript({ videoUrl: input.videoUrl });
      transcriptText = aiTranscript;
    } catch (fallbackError: any) {
      console.error("Fallback AI transcript generation also failed:", fallbackError);
      throw new Error(
        "Could not retrieve or generate a transcript for this video. " +
        "It may be private, age-restricted, or in an unsupported format."
      );
    }
  }

  if (!transcriptText || transcriptText.trim() === '') {
    throw new Error("Failed to get any transcript for the video.");
  }

  const promptText = `You are an expert summarizer. Your task is to create a clear and concise summary of the following video transcript.

Focus on the main ideas, key arguments, and important conclusions. Structure the summary in a few easy-to-read paragraphs.

Video Transcript:
---
${transcriptText.slice(0, 12000)}
---

You MUST return a JSON object matching this schema:
{
  "summary": "string"
}
`;

  const responseText = await callGroqChat({
    messages: [
      { role: 'system', content: 'You are a professional summarizer. You always output valid JSON.' },
      { role: 'user', content: promptText }
    ],
    responseFormat: 'json_object'
  });

  const parsed = JSON.parse(responseText);

  if (!parsed.summary) {
    throw new Error("AI returned an empty summary.");
  }

  return { summary: parsed.summary };
}

