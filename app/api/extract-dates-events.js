// Extract dates and events from documents using GPT-4o
// This endpoint is called after LlamaParse/Mistral has processed the document

import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentText, extractionType } = req.body;

    if (!documentText) {
      return res.status(400).json({ error: 'Document text is required' });
    }

    // Log which extraction method was used
    console.log(`Document processed with ${extractionType} extraction`);

    // Prompt for GPT-4o to extract dates and events
    const prompt = `
      Extract all dates and events from the following legal document. 
      Format the response as a JSON object with two arrays:
      1. "dates": List of all dates mentioned with their context
      2. "events": List of all events mentioned with their descriptions
      
      For each date and event, include:
      - The exact text where it appears
      - The page or section it appears in (if identifiable)
      - Any relevant context about its significance
      
      Document text:
      ${documentText}
    `;

    // Call OpenAI API with GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a legal document analyzer specialized in extracting dates and events from legal documents." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Extract the response
    const extractedData = JSON.parse(completion.choices[0].message.content);

    return res.status(200).json(extractedData);
  } catch (error) {
    console.error('Error extracting dates and events:', error);
    return res.status(500).json({ error: 'Failed to extract dates and events', details: error.message });
  }
} 