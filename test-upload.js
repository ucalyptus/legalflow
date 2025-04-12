const fs = require('fs');
const fetch = require('node-fetch');

async function uploadFile() {
  try {
    const docxBuffer = fs.readFileSync('test.docx');
    const base64Doc = docxBuffer.toString('base64');
    
    const response = await fetch('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentText: base64Doc,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        model: 'gpt-3.5-turbo'
      })
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

uploadFile(); 