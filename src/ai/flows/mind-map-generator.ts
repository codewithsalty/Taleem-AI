'use server';
/**
 * @fileOverview Generates mind maps from uploaded notes or learning material.
 *
 * - generateMindMap - A function that generates a mind map from provided text.
 * - GenerateMindMapInput - The input type for the generateMindMap function.
 * - GenerateMindMapOutput - The return type for the generateMindMap function.
 */

import { z } from 'zod';

const GenerateMindMapInputSchema = z.object({
  text: z
    .string()
    .describe(
      'The notes or learning material to generate a mind map from.'
    ),
});
export type GenerateMindMapInput = z.infer<typeof GenerateMindMapInputSchema>;

const GenerateMindMapOutputSchema = z.object({
  mermaidGraph: z.string().describe("A MermaidJS graph diagram representing the key concepts and their relationships. The graph must use a 'graph TD' layout."),
});
export type GenerateMindMapOutput = z.infer<typeof GenerateMindMapOutputSchema>;

import { callGroqChat } from '../groq';

export async function generateMindMap(input: GenerateMindMapInput): Promise<GenerateMindMapOutput> {
  const promptText = `You are an expert in creating visual summaries. Your task is to generate a MermaidJS mind map from the provided text.

Follow these instructions precisely:
1.  **Analyze the text** to identify the single, most important central concept. This will be the root of your graph.
2.  **Identify main topics** or themes that branch directly from the central concept. There should be at least 2 and up to 4 main topics.
3.  For each main topic, **identify key details or sub-points** that connect to it. Create at least one level of sub-points for each main topic to ensure a hierarchical structure.
4.  The graph layout **MUST be 'graph TD'** (Top Down).
5.  **CRITICAL: Do NOT create a simple linear list** or a flat graph (e.g., A --> B, A --> C, A --> D). The central concept must branch downwards into multiple levels.

**Example of a good, multi-level mind map structure:**
\`\`\`mermaid
graph TD
    A["Central Concept: Photosynthesis"]
    
    A --> B["Inputs"]
    A --> C["Outputs"]
    A --> D["Key Components"]

    B --> B1("Sunlight")
    B --> B2("Carbon Dioxide (CO2)")
    B --> B3("Water (H2O)")

    C --> C1("Oxygen (O2)")
    C --> C2("Glucose (Sugar)")

    D --> D1("Chloroplasts")
    D --> D2("Chlorophyll")
\`\`\`

Now, generate the mind map for the following text. Ensure the output is a valid MermaidJS graph string and follows all the rules and the structural example provided above.

Text:
${input.text}

You MUST return a JSON object matching this schema:
{
  "mermaidGraph": "string" // Containing ONLY the raw mermaid graph text starting with 'graph TD' and no markdown packaging.
}
`;

  try {
    const responseText = await callGroqChat({
      messages: [
        { role: 'system', content: 'You are a professional concept map designer. You always output valid JSON matching the user schema instructions.' },
        { role: 'user', content: promptText }
      ],
      responseFormat: 'json_object'
    });

    return JSON.parse(responseText) as GenerateMindMapOutput;
  } catch (error) {
    console.error("Error in Groq generateMindMap:", error);
    throw new Error(`Failed to generate concept map: ${(error as Error).message}`);
  }
}
