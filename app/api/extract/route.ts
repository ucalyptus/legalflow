import { NextResponse } from 'next/server';
import { convertToPlainText, callOpenAIAPI, extractDatesAndEvents } from './utils';

export async function POST(req: Request) {
  try {
    const { documentText, mimeType, model } = await req.json();
    
    if (!documentText || !mimeType) {
      return new Response(JSON.stringify({ error: 'Document text and MIME type must be provided' }), {
        status: 400,
      });
    }

    // Validate model
    if (!model) {
      return new Response(JSON.stringify({ error: 'Model must be specified' }), {
        status: 400,
      });
    }

    let plainText: string;
    
    // Handle different document types
    if (mimeType === 'text/plain') {
      // For plain text, use it directly
      plainText = documentText;
    } else {
      // For PDF/DOCX, convert to plain text
      const buffer = Buffer.from(documentText, 'base64');
      plainText = await convertToPlainText(buffer, mimeType);
    }

    // Extract dates and events from plain text
    const result = await extractDatesAndEvents(plainText, model);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 