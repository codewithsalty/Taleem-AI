
'use server';
/**
 * @fileOverview Generates presentations from a topic or text content.
 * 
 * - generatePresentation - A function that creates a presentation from a topic or text.
 * - GeneratePresentationInput - The input type for the generatePresentation function.
 * - GeneratePresentationOutput - The return type for the generatePresentation function.
 */

import { z } from 'zod';
import { callGroqChat } from '../groq';

const SlideSchema = z.object({
  title: z.string().describe('The title of the slide.'),
  content: z.array(z.string()).describe('An array of bullet points for the slide content.'),
  imageUrl: z.string().url().optional().describe('A URL for a relevant background image for the slide.'),
});

const GeneratePresentationOutputSchema = z.object({
  title: z.string().describe('The main title of the presentation.'),
  agenda: z.array(z.string()).describe('A list of topics for the agenda slide.'),
  slides: z.array(SlideSchema).describe('An array of content slides.'),
});

export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;

const GeneratePresentationInputSchema = z.object({
  // text is optional — if not provided, AI generates content from topic alone
  text: z.string().optional().describe('The source text for generating the presentation (optional if topic is provided).'),
  topic: z.string().optional().describe('The main topic of the presentation.'),
});

export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
  const hasText = input.text && input.text.trim().length > 0;
  const hasTopic = input.topic && input.topic.trim().length > 0;

  let promptText: string;

  if (hasText) {
    // Content-based mode: summarize and structure provided text
    promptText = `You are an expert presentation designer. Analyze the following content and create a structured slide deck in JSON format.

**Instructions:**
1. **Title:** Create a compelling main title. ${hasTopic ? `The topic is: "${input.topic}"` : 'Use the content to derive a title.'}
2. **Agenda:** Generate 3-5 main section topics for an agenda slide.
3. **Slides:** Create at least 6 content slides. For each slide:
   - A clear, concise \`title\`
   - A \`content\` array of 3-5 short bullet points (plain text, NO markdown like **, *, #)
4. Keep bullet points brief — 1 sentence max per point.

Source Content:
---
${input.text!.slice(0, 10000)}
---

Return ONLY valid JSON:
{
  "title": "string",
  "agenda": ["string"],
  "slides": [{ "title": "string", "content": ["string"] }]
}`;
  } else if (hasTopic) {
    // Topic-only mode: AI generates the full educational content
    promptText = `You are an expert educator and presentation designer. Create a comprehensive, informative slide deck on the topic: "${input.topic}".

**Instructions:**
1. **Title:** Create a compelling, professional title for this presentation.
2. **Agenda:** List 4-6 main sections that will be covered.
3. **Slides:** Create at least 7 detailed content slides covering all important aspects of the topic. For each slide:
   - A clear, engaging \`title\`
   - A \`content\` array of 4-5 informative bullet points (plain text, NO markdown like **, *, #)
   - Cover introduction, key concepts, examples/applications, benefits/challenges, and conclusion
4. Content should be educational, accurate, and engaging for students.

Return ONLY valid JSON:
{
  "title": "string",
  "agenda": ["string"],
  "slides": [{ "title": "string", "content": ["string"] }]
}`;
  } else {
    throw new Error("Please provide either a topic or some text content.");
  }

  try {
    const responseText = await callGroqChat({
      messages: [
        { role: 'system', content: 'You are a professional presentation planner. You always output valid JSON with no extra text.' },
        { role: 'user', content: promptText }
      ],
      responseFormat: 'json_object',
      temperature: 0.4,
    });

    const textPresentation = JSON.parse(responseText) as {
      title: string;
      agenda: string[];
      slides: Array<{ title: string; content: string[] }>;
    };

    if (!textPresentation.title || !textPresentation.slides?.length) {
      throw new Error("AI returned an incomplete presentation structure.");
    }

    // Generate unique visual backgrounds using Pollinations AI (CSS background-image, not next/image)
    const slidesWithImages = textPresentation.slides.map(slide => {
      const visualPrompt = `Professional dark corporate presentation slide background for "${slide.title}". Abstract geometric design, deep navy blue and purple tones, minimal.`;
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(visualPrompt)}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;
      return { ...slide, imageUrl };
    });

    return {
      title: textPresentation.title,
      agenda: textPresentation.agenda || [],
      slides: slidesWithImages,
    };
  } catch (error) {
    console.error("Error in generatePresentation:", error);
    throw new Error(`Failed to generate presentation: ${(error as Error).message}`);
  }
}

