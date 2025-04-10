import { Buffer } from 'buffer';
import * as pdfjsLib from 'pdf-parse';
import * as mammoth from 'mammoth';

export async function convertToPlainText(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    // Detect file type if not provided
    if (!mimeType) {
      // Simple magic number check
      if (buffer.slice(0, 4).toString('hex') === '25504446') { // PDF magic number
        mimeType = 'application/pdf';
      } else if (buffer.slice(0, 2).toString('hex') === '504b') { // ZIP/DOCX magic number
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
    }

    switch (mimeType.toLowerCase()) {
      case 'application/pdf':
        return await extractFromPDF(buffer);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await extractFromDOCX(buffer);
      
      case 'text/plain':
        return buffer.toString('utf-8');
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error in convertToPlainText:', error);
    throw new Error(`Failed to convert document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfjsLib(buffer, {
      // Disable file system operations
      disableFontFace: true,
      useSystemFonts: false,
      verbosity: 0
    });
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
} 