'use server';
/**
 * @fileOverview Extracts text transcript from a YouTube video URL using an AI model as a fallback.
 *
 * - getVideoTranscript - A function that handles the video transcription process.
 * - VideoToTextInput - The input type for the function.
 * - VideoToTextOutput - The return type for the function.
 */

import { ai } from "@/server/ai/genkit";
import { z } from 'genkit';


const VideoToTextInputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the YouTube video to transcribe.'),
});
export type VideoToTextInput = z.infer<typeof VideoToTextInputSchema>;

const VideoToTextOutputSchema = z.object({
  transcript: z.string().describe('The full transcribed text of the video.'),
});
export type VideoToTextOutput = z.infer<typeof VideoToTextOutputSchema>;


const prompt = ai.definePrompt({
    name: 'videoToTextPrompt',
    input: { schema: VideoToTextInputSchema },
    output: { schema: VideoToTextOutputSchema },
    prompt: `You are a video transcription expert. Analyze the video provided via the media URL and provide a full, verbatim transcript of all spoken content.

Video:
{{media url=videoUrl}}
`,
});


const videoToTextFlow = ai.defineFlow(
  {
    name: 'videoToTextFlow',
    inputSchema: VideoToTextInputSchema,
    outputSchema: VideoToTextOutputSchema,
  },
  async (input) => {
    try {
      // The AI model can handle the URL directly.
      const { output } = await prompt(input);
      
      if (!output?.transcript) {
        throw new Error('AI failed to generate a transcript from the video content.');
      }
      
      return output;
    } catch (error: any) {
        console.error("Error in videoToTextFlow:", error);
        // Re-throw the error with a more specific message if possible.
        throw new Error(error.message || 'An unexpected error occurred during AI video transcription.');
    }
  }
);

export async function getVideoTranscript(input: VideoToTextInput): Promise<VideoToTextOutput> {
  return videoToTextFlow(input);
}
