import fs from 'fs';
import fetch from 'node-fetch';

async function uploadFile(filePath, mimeType) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');
    
    console.log(`Uploading ${filePath}...`);
    const response = await fetch('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentText: base64File,
        mimeType: mimeType,
        model: 'gpt-3.5-turbo'
      })
    });

    const result = await response.json();
    console.log(`Response for ${filePath}:`, JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Test DOCX upload
await uploadFile('test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

// Test PDF upload (if you have a PDF file)
// await uploadFile('test.pdf', 'application/pdf'); 