import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { convertToPlainText } from './document-converter';

export const EXTRACTION_PROMPT = `Extract ONLY meaningful legal dates and events from the document into a table format in JSON. Focus on actual legal events, court dates, deadlines, and significant milestones. Ignore document metadata.

Required JSON structure:
{
  "dateEventTable": [
    {
      "date": "YYYY-MM-DD", 
      "event": "Description of what happened or is scheduled to happen on this date",
      "status": "completed|pending|scheduled",
      "page": 1,
      "citation": "Exact text from document showing the date and event"
    }
  ]
}

Rules:
1. ALL dates must be in YYYY-MM-DD format
2. If a date is mentioned without a year, use context to determine the year or default to current year
3. For each date, provide:
   - A detailed event description that captures the legal significance
   - The page number where the date appears in the document
   - A direct quote or citation from the source text showing the date and event
4. Status must be one of:
   - completed: Past events that have already occurred
   - pending: Current/ongoing events or those requiring immediate attention
   - scheduled: Future events and upcoming deadlines
5. ONLY include dates that represent actual legal events, such as:
   - Court dates and hearings
   - Filing deadlines
   - Contract execution dates
   - Important meetings or negotiations
   - Legal notice periods
   - Compliance deadlines
6. DO NOT include:
   - Document metadata (creation date, modification date, etc.)
   - Generic dates without legal significance
   - System or technical dates
7. If no meaningful legal dates are found, return a single entry with:
   - date: current date
   - event: "No significant legal dates were found in the document"
   - status: "completed"
   - page: null
   - citation: null`;

export async function decodeDocumentText(text: string, mimeType?: string): Promise<string> {
  if (!text) return text;
  
  try {
    const buffer = Buffer.from(text, 'base64');
    
    // First try to convert if it's a binary format
    try {
      const plainText = await convertToPlainText(buffer, mimeType || '');
      if (plainText) {
        return plainText.replace(/\s+/g, ' ').trim();
      }
    } catch (error) {
      console.log('Binary conversion failed, trying as plain text:', error);
    }

    // If conversion fails or it's already plain text, try the original decoding
    const decoded = buffer.toString('utf-8');
    
    // Clean up the text
    return decoded.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, ' ')
                 .replace(/\s+/g, ' ')
                 .trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to decode document: ${error.message}`);
    }
    throw new Error('Failed to decode document: Unknown error');
  }
}

export async function callGeminiAPI(documentText: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2000
    }
  });

  try {
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a legal document analyzer. Extract dates and events from this document and format them as specified. Be thorough and don't miss any dates.\n\n${EXTRACTION_PROMPT}\n\nDocument text:\n${documentText}`
        }]
      }]
    });

    const response = result.response;
    const text = response.text();
    
    try {
      const formattedText = text.trim().replace(/^```json\n|\n```$/g, '');
      const parsedResponse = JSON.parse(formattedText);
      
      if (!validateExtractionResponse(parsedResponse)) {
        throw new Error('Invalid response structure from Gemini API. Expected dateEventTable array with date, event, and status fields.');
      }
      
      if (parsedResponse.dateEventTable.length === 0) {
        const today = new Date().toISOString().split('T')[0];
        parsedResponse.dateEventTable.push({
          date: today,
          event: "No significant legal dates were found in the document",
          status: "completed"
        });
      }
      
      return parsedResponse;
    } catch (parseError) {
      throw new Error('Failed to parse Gemini response as JSON');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract information using Gemini API: ${error.message}`);
    }
    throw new Error('Failed to extract information using Gemini API: Unknown error');
  }
}

export async function callOpenRouterAPI(documentText: string, model: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_HOST || 'http://localhost:3000',
      'X-Title': 'LegalFlow'
    }
  });

  const systemPrompt = `You are a legal document analyzer. Your task is to thoroughly extract ALL dates and events from the provided document. Be comprehensive and don't miss any dates. Format the response exactly as specified.`;

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `${EXTRACTION_PROMPT}\n\nDocument text:\n${documentText}`
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    });

    if (!completion || !completion.choices || completion.choices.length === 0) {
      throw new Error('Received empty response from OpenRouter API');
    }

    const message = completion.choices[0]?.message;
    if (!message || typeof message.content !== 'string') {
      throw new Error('Invalid response format from OpenRouter API');
    }

    const response = message.content;
    const cleanedResponse = response.replace(/```json\n|\n```|```/g, '').trim();
    const parsedResponse = JSON.parse(cleanedResponse);
    
    if (!validateExtractionResponse(parsedResponse)) {
      throw new Error('Invalid response structure from OpenRouter API. Expected dateEventTable array with date, event, and status fields.');
    }
    
    if (parsedResponse.dateEventTable.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      parsedResponse.dateEventTable.push({
        date: today,
        event: "No significant legal dates were found in the document",
        status: "completed"
      });
    }
    
    return parsedResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract information using OpenRouter API: ${error.message}`);
    }
    throw new Error('Failed to extract information using OpenRouter API: Unknown error');
  }
}

export function validateExtractionResponse(response: any): boolean {
  if (!response || typeof response !== 'object') return false;
  if (!Array.isArray(response.dateEventTable)) return false;
  
  for (const entry of response.dateEventTable) {
    if (!entry.date || !entry.event || !entry.status) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) return false;
    if (!['completed', 'pending', 'scheduled'].includes(entry.status)) return false;
  }
  
  return true;
} 