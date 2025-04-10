import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

interface ExtractionRequest {
  documentText: string;
  model: 'gemini-pro' | 'gemini-2.0-flash' | string;
  apiType: 'google' | 'openrouter';
  extractionTypes: string[];
}

// Function to decode base64 if needed
function decodeDocumentText(text: string): string {
  // Check if the text is base64 encoded
  const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
  if (base64Regex.test(text)) {
    try {
      const decoded = Buffer.from(text, 'base64').toString('utf-8');
      // Check if the decoded text looks like actual text
      if (/^[\x20-\x7E\s]*$/.test(decoded)) {
        return decoded;
      }
    } catch (error) {
      console.log('Not a valid base64 string, using original text');
    }
  }
  return text;
}

const EXTRACTION_PROMPT = `Extract ONLY meaningful legal dates and events from the document into a table format in JSON. Focus on actual legal events, court dates, deadlines, and significant milestones. Ignore document metadata.

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
   - citation: null

Please list all dates chronologically and ensure each event description clearly explains its legal significance. Include page numbers and relevant citations for every date extracted.`;

async function callGeminiAPI(documentText: string) {
  console.log('Using API Key:', process.env.GEMINI_API_KEY ? 'Key is set' : 'Key is not set');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2000
    }
  });

  try {
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a legal document analyzer. Extract dates and events from this document and format them as specified. Be thorough and don't miss any dates.\n\n${EXTRACTION_PROMPT}\n\nDocument text:\n${documentText}`
        }]
      }]
    });

    console.log('Received response from Gemini API');
    const response = result.response;
    console.log('Response object:', JSON.stringify(response, null, 2));
    const text = response.text();
    console.log('Raw text response:', text);
    console.log('Response type:', typeof text);
    
    try {
      // Try to format the text as JSON if it's not already
      const formattedText = text.trim().replace(/^```json\n|\n```$/g, '');
      console.log('Formatted text:', formattedText);
      
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
      console.error('Gemini Parse Error:', parseError);
      console.error('Raw Gemini Response:', text);
      throw new Error('Failed to parse Gemini response as JSON');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to extract information using Gemini API: ${error.message}`);
    }
    throw new Error('Failed to extract information using Gemini API: Unknown error');
  }
}

async function callOpenRouterAPI(documentText: string, model: string) {
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

    // Check if completion and choices array exist
    if (!completion || !completion.choices || completion.choices.length === 0) {
      console.error('Empty response from OpenRouter API:', completion);
      throw new Error('Received empty response from OpenRouter API');
    }

    // Check if message and content exist
    const message = completion.choices[0]?.message;
    if (!message || typeof message.content !== 'string') {
      console.error('Invalid message format from OpenRouter API:', message);
      throw new Error('Invalid response format from OpenRouter API');
    }

    const response = message.content;
    try {
      // Clean the response of any markdown formatting
      const cleanedResponse = response.replace(/```json\n|\n```|```/g, '').trim();
      console.log('Cleaned response:', cleanedResponse);
      
      const parsedResponse = JSON.parse(cleanedResponse);
      if (!validateExtractionResponse(parsedResponse)) {
        console.error('Invalid response structure:', parsedResponse);
        throw new Error('Invalid response structure from OpenRouter API. Expected dateEventTable array with date, event, and status fields.');
      }
      if (parsedResponse.dateEventTable.length === 0) {
        // Add a default entry if no dates were found
        const today = new Date().toISOString().split('T')[0];
        parsedResponse.dateEventTable.push({
          date: today,
          event: "No dates or events were found in the document",
          status: "completed"
        });
      }
      return parsedResponse;
    } catch (parseError: unknown) {
      console.error('OpenRouter Parse Error:', parseError);
      console.error('Raw OpenRouter Response:', response);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      throw new Error(`Failed to parse OpenRouter response as JSON: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to extract information using OpenRouter API: ${error.message}`);
    }
    throw new Error('Failed to extract information using OpenRouter API');
  }
}

function validateExtractionResponse(response: any): boolean {
  // Check basic structure
  if (!response || typeof response !== 'object') {
    console.error('Response is not an object');
    return false;
  }

  if (!Array.isArray(response.dateEventTable)) {
    console.error('dateEventTable is not an array');
    return false;
  }

  // Check if array is empty
  if (response.dateEventTable.length === 0) {
    console.warn('dateEventTable is empty');
    return true; // We handle empty arrays separately by adding a default entry
  }

  // Validate each entry
  return response.dateEventTable.every((entry: any, index: number) => {
    // Check required fields exist
    if (!entry.date || !entry.event || !entry.status) {
      console.error(`Entry ${index} is missing required fields`);
      return false;
    }

    // Validate date format and value
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(entry.date)) {
      console.error(`Entry ${index} has invalid date format: ${entry.date}`);
      return false;
    }

    // Validate date is real and not in distant past/future
    try {
      const date = new Date(entry.date);
      const year = date.getFullYear();
      if (year < 1900 || year > 2100) {
        console.error(`Entry ${index} has unrealistic year: ${year}`);
        return false;
      }
      if (date.toString() === 'Invalid Date') {
        console.error(`Entry ${index} has invalid date value: ${entry.date}`);
        return false;
      }
    } catch (e) {
      console.error(`Entry ${index} date parsing error: ${e}`);
      return false;
    }

    // Validate status
    const validStatuses = ['completed', 'pending', 'scheduled'];
    if (!validStatuses.includes(entry.status)) {
      console.error(`Entry ${index} has invalid status: ${entry.status}`);
      return false;
    }

    // Validate event description
    if (typeof entry.event !== 'string' || entry.event.trim().length < 10) {
      console.error(`Entry ${index} has invalid or too short event description`);
      return false;
    }

    // Validate chronological order
    if (index > 0) {
      const prevDate = new Date(response.dateEventTable[index - 1].date);
      const currDate = new Date(entry.date);
      if (currDate < prevDate) {
        console.warn(`Dates are not in chronological order at index ${index}`);
        // Don't return false here as the data might still be valid
      }
    }

    return true;
  });
}

export async function POST(request: Request) {
  try {
    const body: ExtractionRequest = await request.json();
    const { documentText, model, apiType } = body;

    if (!documentText) {
      return NextResponse.json(
        { status: 'error', error: 'No document text provided' },
        { status: 400 }
      );
    }

    const decodedText = decodeDocumentText(documentText);

    let extractedData;
    try {
      if (apiType === 'google' && (model === 'gemini-pro' || model === 'gemini-2.0-flash')) {
        extractedData = await callGeminiAPI(decodedText);
      } else if (apiType === 'openrouter') {
        extractedData = await callOpenRouterAPI(decodedText, model);
      } else {
        throw new Error(`Invalid combination of apiType (${apiType}) and model (${model})`);
      }
    } catch (error) {
      console.error('API call error:', error);
      return NextResponse.json(
        { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Failed to extract information from the document'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: extractedData
    });
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { status: 'error', error: 'Failed to process extraction request' },
      { status: 500 }
    );
  }
}

export { callGeminiAPI, callOpenRouterAPI };