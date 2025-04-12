import { Buffer } from 'buffer';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { OpenAI } from 'openai';

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
}`;

export async function convertToPlainText(buffer: Buffer, mimeType: string): Promise<string> {
  console.log('Converting document to plain text, mime type:', mimeType);
  
  try {
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      if (!result || !result.value) {
        throw new Error('DOCX extraction produced no text');
      }
      console.log('DOCX conversion successful, text length:', result.value.length);
      return result.value;
    } 
    
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      if (!data || !data.text) {
        throw new Error('PDF extraction produced no text');
      }
      console.log('PDF conversion successful, text length:', data.text.length);
      return data.text;
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    console.error('Document conversion error:', error);
    throw new Error(`Failed to convert document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function callOpenAIAPI(documentText: string, model: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });

  // Verify we're working with decoded text
  if (/^[A-Za-z0-9+/=]+$/.test(documentText.replace(/\s/g, ''))) {
    throw new Error('Document text appears to be base64 encoded. Please decode before calling API.');
  }

  console.log('\nFirst 500 chars of document text:', documentText.slice(0, 500));
  console.log('\nDocument text length:', documentText.length);

  try {
    // Ensure we're using a valid model name and fallback to GPT-3.5 if rate limited
    let validModel = model === 'gpt-4o' ? 'gpt-4' : model;
    console.log('Using OpenAI model:', validModel);
    
    // Split document into chunks of roughly 2000 characters
    const chunkSize = 2000;
    const chunks = [];
    for (let i = 0; i < documentText.length; i += chunkSize) {
      chunks.push(documentText.slice(i, i + chunkSize));
    }

    console.log(`Split document into ${chunks.length} chunks`);

    // Process each chunk with retry logic
    const allResults = [];
    for (const chunk of chunks) {
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const completion = await openai.chat.completions.create({
            model: validModel,
            messages: [
              {
                role: 'system',
                content: 'You are a legal document analyzer specializing in extracting dates and events from legal documents. Return ONLY valid JSON in the specified format. Do not include any other text or explanation. If no dates or events are found, return an empty dateEventTable array.'
              },
              {
                role: 'user',
                content: `${EXTRACTION_PROMPT}\n\nDocument text:\n${chunk}`
              }
            ],
            temperature: 0.1,
            max_tokens: 2000
          });

          const message = completion.choices[0]?.message;
          if (!message || typeof message.content !== 'string') {
            throw new Error('Invalid response format from OpenAI API');
          }

          console.log('Raw response from chunk:', message.content);
          
          try {
            // Ensure the response is valid JSON and matches our expected format
            const parsedResponse = JSON.parse(message.content);
            if (!parsedResponse || typeof parsedResponse !== 'object' || !Array.isArray(parsedResponse.dateEventTable)) {
              console.error('Response does not match expected format:', message.content);
              throw new Error('Response does not match expected format');
            }
            if (parsedResponse.dateEventTable) {
              allResults.push(...parsedResponse.dateEventTable);
            }
            break; // Success, exit retry loop
          } catch (parseError) {
            console.error('Failed to parse chunk response:', parseError);
            console.error('Raw content that failed to parse:', message.content);
            throw parseError; // Re-throw to trigger retry
          }
        } catch (error) {
          retryCount++;
          
          // If it's a rate limit error and we're using GPT-4, fallback to GPT-3.5-turbo
          if (error && typeof error === 'object' && 'code' in error && error.code === 'rate_limit_exceeded' && validModel.includes('gpt-4')) {
            console.log('Rate limit hit for GPT-4, falling back to GPT-3.5-turbo');
            validModel = 'gpt-3.5-turbo';
            continue;
          }
          
          // If we've exhausted retries, throw the error
          if (retryCount === maxRetries) {
            throw error;
          }
          
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Combine all results and remove duplicates
    const uniqueResults = allResults.filter((event, index, self) =>
      index === self.findIndex((e) => e.date === event.date && e.event === event.event)
    );

    return {
      dateEventTable: uniqueResults
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    // Return empty results instead of throwing
    return {
      dateEventTable: []
    };
  }
}

export async function extractDatesAndEvents(documentText: string, model: string) {
  try {
    // Verify we have valid input
    if (!documentText || typeof documentText !== 'string') {
      throw new Error('Invalid document text provided');
    }

    if (!model) {
      throw new Error('Model must be specified');
    }

    // Decode base64 if needed
    let decodedText = documentText;
    if (/^[A-Za-z0-9+/=]+$/.test(documentText.replace(/\s/g, ''))) {
      try {
        decodedText = Buffer.from(documentText, 'base64').toString('utf-8');
      } catch (decodeError) {
        throw new Error('Failed to decode base64 text');
      }
    }

    // Call OpenAI API to extract dates and events
    const result = await callOpenAIAPI(decodedText, model);

    // Validate the response format
    if (!result || !Array.isArray(result.dateEventTable)) {
      throw new Error('Invalid response format from extraction');
    }

    return result;
  } catch (error) {
    console.error('Error extracting dates and events:', error);
    throw error;
  }
} 