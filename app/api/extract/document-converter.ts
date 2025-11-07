import { Buffer } from 'buffer';
import pdfjsLib from 'pdf-parse';
import * as mammoth from 'mammoth';
import { detect } from 'jschardet';

// More comprehensive magic numbers for file type detection
const MAGIC_NUMBERS = {
  PDF: '25504446',
  DOCX: '504b0304', // More specific ZIP/DOCX signature
  DOC: 'd0cf11e0' // Old DOC format
};

// Function to check if a string contains binary data
function containsBinaryData(str: string): boolean {
  // Check for common binary patterns
  const binaryPattern = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g;
  const binaryCount = (str.match(binaryPattern) || []).length;
  return binaryCount > str.length * 0.1; // More than 10% binary characters
}

// Function to validate and clean text
function validateAndCleanText(text: string): string {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text input');
  }

  if (containsBinaryData(text)) {
    throw new Error('Text contains binary data');
  }

  // Remove control characters and normalize whitespace
  const cleaned = text
    .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\r\n|\r|\n/g, '\n')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/[^\S\n]+/g, ' ')
    .trim();

  if (!cleaned) {
    throw new Error('Cleaning resulted in empty text');
  }

  // Validate the cleaned text
  if (containsBinaryData(cleaned)) {
    throw new Error('Cleaned text still contains binary data');
  }

  return cleaned;
}

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
      const data = await pdfjsLib(buffer);
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

async function extractFromPDF(buffer: Buffer): Promise<string> {
  console.log('Extracting text from PDF...');
  try {
    const data = await pdfjsLib(buffer);

    if (!data || !data.text) {
      throw new Error('PDF extraction produced no text');
    }

    // Pre-clean the PDF text
    const text = validateAndCleanText(data.text);
    console.log('PDF extraction successful. Text length:', text.length);
    return text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  console.log('Extracting text from DOCX...');
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result || !result.value) {
      throw new Error('DOCX extraction produced no text');
    }

    // Pre-clean the DOCX text
    const text = validateAndCleanText(result.value);
    console.log('DOCX extraction successful. Text length:', text.length);
    
    if (result.messages.length > 0) {
      console.log('DOCX extraction messages:', result.messages);
    }
    
    return text;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`DOCX extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handlePlainText(buffer: Buffer): Promise<string> {
  console.log('Processing plain text...');
  try {
    // Detect the text encoding
    const detection = detect(buffer);
    console.log('Detected encoding:', detection);
    
    // Use detected encoding or fall back to UTF-8
    const encoding = detection.encoding || 'utf-8';
    const text = buffer.toString(encoding as BufferEncoding);
    
    if (!text) {
      throw new Error('Text decoding produced empty result');
    }
    
    // Clean and validate the plain text
    const cleaned = validateAndCleanText(text);
    console.log('Text processing successful. Length:', cleaned.length);
    return cleaned;
  } catch (error) {
    console.error('Text processing error:', error);
    throw new Error(`Text processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 