import { NextRequest, NextResponse } from 'next/server';
import { convertToPlainText, callOpenAIAPI, extractDatesAndEvents } from './utils';

export async function POST(req: NextRequest) {
  console.log('Received POST request to /api/extract');
  try {
    const body = await req.json();
    console.log('Request body:', { ...body, documentText: '[REDACTED]' });
    
    const { documentText, mimeType, model } = body;
    
    if (!documentText || !mimeType) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Document text and MIME type must be provided' },
        { status: 400 }
      );
    }

    // Validate model
    if (!model) {
      console.log('Missing model field');
      return NextResponse.json(
        { error: 'Model must be specified' },
        { status: 400 }
      );
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

    console.log('Processing document with model:', model);
    const result = await extractDatesAndEvents(plainText, model);
    console.log('Successfully processed document');
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 