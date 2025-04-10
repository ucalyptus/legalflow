import { NextResponse } from 'next/server';
import { callGeminiAPI, callOpenRouterAPI, decodeDocumentText } from './utils';

interface ExtractionRequest {
  documentText: string;
  mimeType?: string;
  model: 'gemini-pro' | 'gemini-2.0-flash' | 'gpt-4o' | string;
  apiType: 'google' | 'openrouter' | 'openai';
  extractionTypes: string[];
}

export async function POST(request: Request) {
  try {
    const body: ExtractionRequest = await request.json();
    const { documentText, model, apiType, mimeType } = body;

    // Decode and validate document text
    const decodedText = await decodeDocumentText(documentText, mimeType);
    if (!decodedText) {
      return NextResponse.json({ error: 'No document text provided' }, { status: 400 });
    }

    let result;
    try {
      switch (apiType) {
        case 'google':
          result = await callGeminiAPI(decodedText);
          break;
        case 'openrouter':
          result = await callOpenRouterAPI(decodedText, model);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid API type specified' },
            { status: 400 }
          );
      }

      return NextResponse.json(result);
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'An unknown error occurred' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request Error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
} 