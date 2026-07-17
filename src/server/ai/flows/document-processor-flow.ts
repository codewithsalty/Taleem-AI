'use server';
/**
 * @fileOverview A function to process documents and return chunked text content.
 * It takes either text or a file data URI and returns chunked text content.
 *
 * - processDocument - A function that handles the document processing.
 * - ProcessDocumentInput - The input type for the processDocument function.
 * - ProcessDocumentOutput - The return type for the processDocument function.
 */

import { z } from 'zod';
import zlib from 'zlib';

const ProcessDocumentInputSchema = z.object({
  dataUri: z.string().optional().describe(
    "A document file (e.g., PDF, TXT) as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  text: z.string().optional().describe('Plain text content of the document.'),
});

export type ProcessDocumentInput = z.infer<typeof ProcessDocumentInputSchema>;

const ProcessDocumentOutputSchema = z.object({
  chunks: z.array(z.string()).describe('An array of text chunks extracted from the document.'),
});

export type ProcessDocumentOutput = z.infer<typeof ProcessDocumentOutputSchema>;

/**
 * Extracts plain text from a PDF Buffer using native stream search and zlib decompression.
 */
function extractTextFromPdf(pdfBuffer: Buffer): string {
  const pdfString = pdfBuffer.toString('binary');
  const simpleStreamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const streams: string[] = [];
  let match;
  
  while ((match = simpleStreamRegex.exec(pdfString)) !== null) {
    streams.push(match[1]);
  }
  
  let extractedText = '';
  
  for (const streamData of streams) {
    try {
      const buf = Buffer.from(streamData, 'binary');
      // Try to inflate FlateDecoded stream content
      const decompressed = zlib.inflateSync(buf);
      const decompressedStr = decompressed.toString('binary');
      
      // Extract text content inside PDF text objects (BT ... ET)
      const btMatches = decompressedStr.match(/BT[\s\S]*?ET/g);
      if (btMatches) {
        for (const bt of btMatches) {
          const parenMatches = bt.match(/\(([^)]*)\)/g);
          if (parenMatches) {
            const line = parenMatches.map(m => m.slice(1, -1)).join('');
            extractedText += line + '\n';
          }
        }
      } else {
        const parenMatches = decompressedStr.match(/\(([^)]*)\)/g);
        if (parenMatches) {
          extractedText += parenMatches.map(m => m.slice(1, -1)).join(' ') + '\n';
        }
      }
    } catch (e) {
      // Stream decompression failed or is binary asset
    }
  }
  
  // Fallback: match any plaintext BT ... ET inside the PDF directly
  if (!extractedText.trim()) {
    const rawMatches = pdfString.match(/BT[\s\S]*?ET/g);
    if (rawMatches) {
      for (const bt of rawMatches) {
        const parenMatches = bt.match(/\(([^)]*)\)/g);
        if (parenMatches) {
          extractedText += parenMatches.map(m => m.slice(1, -1)).join('') + '\n';
        }
      }
    }
  }
  
  // Clean up PDF string escaping syntax and unescape typical entities
  return extractedText
    .replace(/\\([\(\)\\])/g, '$1') 
    .replace(/\r/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();
}

/**
 * Splits text content into overlapping chunks of words.
 */
function chunkText(text: string, chunkSize: number = 300, overlap: number = 50): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks: string[] = [];
  
  if (words.length <= chunkSize) {
    return [text];
  }
  
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push(chunkWords.join(' '));
    i += (chunkSize - overlap);
  }
  
  return chunks;
}

export async function processDocument(input: ProcessDocumentInput): Promise<ProcessDocumentOutput> {
  if (!input.dataUri && !input.text) {
    throw new Error("Either dataUri or text must be provided.");
  }

  let fullText = input.text || '';

  if (input.dataUri) {
    try {
      const parts = input.dataUri.split(';base64,');
      if (parts.length !== 2) {
        throw new Error("Invalid base64 Data URI format.");
      }
      
      const meta = parts[0];
      const base64Data = parts[1];
      const mimeType = meta.split(':')[1] || '';
      const buffer = Buffer.from(base64Data, 'base64');

      let fileText = '';
      if (mimeType.toLowerCase().includes('pdf')) {
        fileText = extractTextFromPdf(buffer);
      } else {
        // Default to utf-8 plain text for text, md, etc.
        fileText = buffer.toString('utf-8');
      }

      if (fileText.trim().length > 0) {
        fullText = (fullText ? fullText + '\n\n' : '') + fileText;
      }
    } catch (err) {
      console.error("Error decoding and parsing document dataUri:", err);
      throw new Error(`Failed to extract text from document: ${(err as Error).message}`);
    }
  }

  if (fullText.trim().length === 0) {
    throw new Error("Could not extract any content from the document.");
  }

  const chunks = chunkText(fullText);
  return { chunks };
}
