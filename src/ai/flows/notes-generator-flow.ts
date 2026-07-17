
'use server';
/**
 * @fileOverview Generates structured study notes from a document or text, with an optional AI-generated diagram.
 * 
 * - generateNotes - A function that creates notes from text content.
 * - GenerateNotesInput - The input type for the generateNotes function.
 * - GenerateNotesOutput - The return type for the generateNotes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { NotesOutputSchema, type NotesOutput } from '@/lib/types';
import { processDocument } from './document-processor-flow';
import { generateMindMap } from './mind-map-generator';

const GenerateNotesInputSchema = z.object({
  text: z.string().optional().describe('The source text for generating notes.'),
  dataUri: z.string().optional().describe(
    "A document file (e.g., PDF, TXT) as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  prompt: z.string().optional().describe('An optional user prompt to guide note generation (e.g., "focus on the main themes").'),
  includeDiagram: z.boolean().optional().describe('Whether to include an AI-generated diagram image.'),
  includeConceptMap: z.boolean().optional().describe('Whether to include a concept map.'),
  language: z.preprocess((val) => val === 'on' ? 'ur' : 'en', z.enum(['en', 'ur'])).optional(),
});

export type GenerateNotesInput = z.infer<typeof GenerateNotesInputSchema>;
export type GenerateNotesOutput = z.infer<typeof NotesOutputSchema>;


const notesPrompt = ai.definePrompt({
    name: 'generateNotesTextPrompt',
    input: { schema: GenerateNotesInputSchema.omit({ includeDiagram: true, includeConceptMap: true }) },
    output: { schema: NotesOutputSchema.omit({ diagram: true, conceptMap: true }) },
    prompt: `You are an expert academic assistant who specializes in creating clear, concise, and well-structured study notes from a given text or document. Your response should be in {{language}}.

    Your task is to analyze the following content and generate notes in the specified JSON format. The notes should be easy to understand, well-organized, and highlight the most important information.

    **CRITICAL Instructions:**
    1.  **Title:** Create a descriptive title for the notes based on the text's content.
    2.  **Summary:** Write a 1-2 sentence summary of the entire text.
    3.  **Sections:** Divide the content into logical sections. For each section:
        -   Create a clear and concise \`heading\`.
        -   Break down the information into a \`content\` array of bullet points. Each bullet point should be a string.
        -   **CRITICAL: Do NOT use any markdown formatting (e.g., \`**\`, \`*\`, \`#\`). All text must be plain text.**
        -   Identify key terms, definitions, or critical information within the text and represent them accurately.

    {{#if prompt}}
    **User Guidance:** Pay special attention to the following instruction from the user: "{{{prompt}}}"
    {{/if}}

    **Source Content:**
    ---
    {{#if dataUri}}
    {{media url=dataUri}}
    {{/if}}
    {{#if text}}
    {{{text}}}
    {{/if}}
    ---

    Generate the text-based notes now, adhering strictly to the JSON output schema and all formatting rules.
    `,
});

const diagramPromptGenerator = ai.definePrompt({
    name: 'generateDiagramPromptForNotes',
    input: { schema: z.object({ text: z.string(), title: z.string() }) },
    output: { schema: z.object({ diagramPrompt: z.string() }) },
    prompt: `You are an expert at creating prompts for an AI image generator. Based on the following text and title, create a concise, descriptive prompt for generating a beautiful, hand-drawn style educational diagram. The diagram should illustrate the main concept of the text.

    Follow these prompt patterns:

    Example 1:
    Input Text: "Photosynthesis is the process by which green plants... convert water, carbon dioxide... into oxygen and glucose."
    Output Prompt: "Photosynthesis
An educational diagram of photosynthesis in plants:
- Show sunlight, leaves, chloroplast
- Indicate CO2 intake, O2 release, glucose production
- Simple labeling of main components
- Light green, yellow color scheme
- Hand-drawn style with bold outlines"

    Example 2:
    Input Text: "The water cycle involves evaporation, condensation, and precipitation..."
    Output Prompt: "Water Cycle
A colorful hand-drawn diagram illustrating the water cycle:
- Evaporation (arrows from ocean)
- Condensation (clouds forming)
- Precipitation (rain from clouds)
- Collection (rivers, lakes)
- Include simple icons: sun, cloud, raindrops
- Vibrant educational style"

    Now, generate a similar prompt for the following content:

    Title: {{{title}}}
    Text:
    {{{text}}}
    `,
});


import { callGroqChat } from '../groq';

export async function generateNotes(input: GenerateNotesInput): Promise<GenerateNotesOutput> {
    if (!input.dataUri && !input.text) {
        throw new Error("Either dataUri or text must be provided.");
    }

    // 1. Gather all raw text (process document if dataUri is provided)
    let sourceText = input.text || '';
    if (input.dataUri) {
        try {
            const { chunks } = await processDocument({ dataUri: input.dataUri });
            sourceText += (sourceText ? '\n\n' : '') + chunks.join('\n\n');
        } catch (e) {
            console.error("Failed to extract document text:", e);
        }
    }

    // 2. Generate text notes using Groq
    const languageLabel = input.language === 'ur' ? 'Urdu' : 'English';
    const notesPromptText = `You are an expert academic assistant who specializes in creating clear, concise, and well-structured study notes from a given text or document. Your response must be in ${languageLabel}.

Your task is to analyze the following content and generate notes in the specified JSON format. The notes should be easy to understand, well-organized, and highlight the most important information.

**CRITICAL Instructions:**
1.  **Title:** Create a descriptive title for the notes based on the text's content.
2.  **Summary:** Write a 1-2 sentence summary of the entire text.
3.  **Sections:** Divide the content into logical sections. For each section:
    -   Create a clear and concise \`heading\`.
    -   Break down the information into a \`content\` array of bullet points. Each bullet point should be a string.
    -   **CRITICAL: Do NOT use any markdown formatting (e.g., \`**\`, \`*\`, \`#\`). All text must be plain text.**
    -   Identify key terms, definitions, or critical information within the text and represent them accurately.

${input.prompt ? `**User Guidance:** Pay special attention to the following instruction from the user: "${input.prompt}"` : ''}

**Source Content:**
---
${sourceText}
---

You MUST return a JSON object matching this schema:
{
  "title": "string",
  "summary": "string",
  "sections": [
    {
      "heading": "string",
      "content": ["string"]
    }
  ]
}
`;

    let textNotes: { title: string; summary: string; sections: Array<{ heading: string; content: string[] }> };
    try {
        const responseText = await callGroqChat({
            messages: [
                { role: 'system', content: 'You are a professional academic notes builder. You always output valid JSON matching the user schema instructions.' },
                { role: 'user', content: notesPromptText }
            ],
            responseFormat: 'json_object'
        });
        textNotes = JSON.parse(responseText);
    } catch (error) {
        console.error("Failed to generate notes text via Groq:", error);
        throw new Error(`Failed to generate notes content: ${(error as Error).message}`);
    }

    let finalNotes: NotesOutput = {
        title: textNotes.title,
        summary: textNotes.summary,
        sections: textNotes.sections,
    };

    // 3. Generate diagram if requested
    if (input.includeDiagram) {
        try {
            const diagramPromptText = `You are an expert designer of educational diagrams. Your task is to generate a highly detailed prompt for an AI image generator to create a clear, educational, and visually appealing diagram or infographic that explains the key concepts in the text.
            
Example Output:
"A clean, educational infographic detailing the water cycle. It shows the flow of water with:
- Evaporation (arrows from ocean)
- Condensation (clouds forming)
- Precipitation (rain from clouds)
- Collection (rivers, lakes)
- Include simple icons: sun, cloud, raindrops
- Vibrant educational style"

Now, generate a similar prompt for the following content:
Title: ${textNotes.title}
Text:
${sourceText.substring(0, 2000)}

You MUST return a JSON object matching this schema:
{
  "diagramPrompt": "string"
}
`;
            const diagramPromptResponse = await callGroqChat({
                messages: [
                    { role: 'system', content: 'You are a professional diagram prompt writer. You always output valid JSON.' },
                    { role: 'user', content: diagramPromptText }
                ],
                responseFormat: 'json_object'
            });
            const parsed = JSON.parse(diagramPromptResponse);
            if (parsed.diagramPrompt) {
                // Use Pollinations AI for free reliable image generation
                finalNotes.diagram = `https://image.pollinations.ai/prompt/${encodeURIComponent(parsed.diagramPrompt)}?width=1024&height=1024&nologo=true`;
            }
        } catch (error) {
            console.error("Failed to generate diagram for notes:", error);
        }
    }

    // 4. Generate concept map if requested
    if (input.includeConceptMap) {
        try {
            const { mermaidGraph } = await generateMindMap({ text: sourceText.substring(0, 4000) });
            if (mermaidGraph) {
                finalNotes.conceptMap = mermaidGraph;
            }
        } catch (error) {
            console.error("Failed to generate concept map for notes:", error);
        }
    }

    return finalNotes;
}
