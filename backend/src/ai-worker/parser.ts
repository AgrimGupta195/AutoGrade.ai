import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';
import { getGeminiClient } from '../services/GeminiService';

// Supported MIME types and their extraction prompts
const SUPPORTED_TYPES: Record<string, { mimeType: string; prompt: string }> = {
  'application/pdf': {
    mimeType: 'application/pdf',
    prompt: 'Extract all readable text from this PDF. Return only plain text content in reading order.',
  },
  'text/plain': {
    mimeType: 'text/plain',
    prompt: 'Extract the text content. Return plain text only.',
  },
  'text/html': {
    mimeType: 'text/html',
    prompt: 'Extract all readable text content from this HTML. Ignore HTML tags and scripts. Return only plain text.',
  },
  'application/msword': {
    mimeType: 'application/msword',
    prompt: 'Extract all readable text from this Word document. Return plain text in reading order.',
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    prompt: 'Extract all readable text from this DOCX document. Return plain text in reading order.',
  },
  'image/jpeg': {
    mimeType: 'image/jpeg',
    prompt: 'Extract all readable text from this image. Return plain text only.',
  },
  'image/png': {
    mimeType: 'image/png',
    prompt: 'Extract all readable text from this image. Return plain text only.',
  },
  'image/webp': {
    mimeType: 'image/webp',
    prompt: 'Extract all readable text from this image. Return plain text only.',
  },
  'image/gif': {
    mimeType: 'image/gif',
    prompt: 'Extract all readable text from this image. Return plain text only.',
  },
  'application/vnd.ms-excel': {
    mimeType: 'application/vnd.ms-excel',
    prompt: 'Extract all data from this Excel spreadsheet. Return as plain text with row and column structure preserved.',
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    prompt: 'Extract all data from this XLSX spreadsheet. Return as plain text with row and column structure preserved.',
  },
  'text/csv': {
    mimeType: 'text/csv',
    prompt: 'Extract all data from this CSV file. Return as plain text.',
  },
};

/**
 * Parse file from URL and extract text content
 * @param fileUrl URL of the file to parse
 * @returns Extracted text content
 */
export async function textParser(fileUrl: string): Promise<string> {
  const ai = getGeminiClient();
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file. Status: ${response.status}`);
    }

    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim();
    
    // Check if file type is supported
    if (!SUPPORTED_TYPES[contentType]) {
      throw new Error(
        `Unsupported file type: ${contentType}. Supported types: ${Object.keys(SUPPORTED_TYPES).join(', ')}`
      );
    }

    const fileBuffer = await response.arrayBuffer();
    const fileBase64 = Buffer.from(fileBuffer).toString('base64');
    const { mimeType, prompt } = SUPPORTED_TYPES[contentType];

    const extractionResponse: any = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: fileBase64,
          },
        },
        {
          text: prompt,
        },
      ],
    });

    const extractedText =
      extractionResponse.text ||
      extractionResponse.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('\n') ||
      '';

    if (!extractedText.trim()) {
      throw new Error(`Gemini returned empty text for file type: ${contentType}`);
    }

    return extractedText;
  } catch (error) {
    throw new Error(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get list of supported file types
 * @returns Array of supported MIME types
 */
export function getSupportedFileTypes(): string[] {
  return Object.keys(SUPPORTED_TYPES);
}
// console.log(textParser('https://drive.google.com/file/d/14X3q_pwOJyAF-hmOyX7kZWC0W-pI0dYg/view?usp=sharing'));


