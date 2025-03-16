// API endpoint to query multiple documents using GPT-4o

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
    const { query, documentIds } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: 'At least one document ID is required' });
    }

    // In a real implementation, you would fetch the actual documents from your database
    // For now, we'll simulate fetching documents
    const documents = await fetchDocuments(documentIds);

    // Prepare the context for the LLM
    const context = prepareContext(documents);

    // Call OpenAI API with GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a legal document analyzer specialized in extracting information from multiple legal documents and answering questions about them. Provide clear, concise answers and cite the specific document when referencing information." 
        },
        { 
          role: "user", 
          content: `I have the following legal documents:\n\n${context}\n\nMy question is: ${query}` 
        }
      ]
    });

    // Extract the response
    const result = completion.choices[0].message.content;

    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error querying documents:', error);
    return res.status(500).json({ error: 'Failed to query documents', details: error.message });
  }
}

// Simulate fetching documents from database
async function fetchDocuments(documentIds) {
  // In a real implementation, you would fetch these from your database
  // For now, we'll return simulated documents
  
  // Sample documents
  const sampleDocuments = [
    {
      id: 'doc1',
      name: 'Deal 1 - Shareholders Agreement',
      content: `SHAREHOLDERS AGREEMENT

This Shareholders Agreement (the "Agreement") is made and entered into as of January 15, 2023 (the "Effective Date"), by and among Acme Corporation, a Delaware corporation (the "Company"), and the individuals and entities listed on Exhibit A attached hereto (each, a "Shareholder" and collectively, the "Shareholders").

The parties to this Agreement are as follows:
1. Acme Corporation ("Company")
2. John Smith ("Founder")
3. XYZ Ventures ("Investor A")
4. Global Capital Partners ("Investor B")

The parties agree to the following terms:
- Initial investment of $5M from Investor A on February 1, 2023
- Secondary investment of $10M from Investor B on March 15, 2023
- Board meeting scheduled for the first Monday of each quarter
- Annual shareholder meeting on May 15, 2023
- Company valuation set at $50M post-money

This Agreement shall be governed by the laws of the State of Delaware.`,
      tags: ['documentType:Shareholder Agreement', 'dealStage:Executed', 'parties:Acme Corporation', 'dealSize:$10M-$50M', 'jurisdiction:US']
    },
    {
      id: 'doc2',
      name: 'Deal 2 - Shareholders Agreement',
      content: `SHAREHOLDERS AGREEMENT

This Shareholders Agreement (the "Agreement") is made and entered into as of March 10, 2023 (the "Effective Date"), by and among Globex International, a UK company (the "Company"), and the individuals and entities listed on Exhibit A attached hereto (each, a "Shareholder" and collectively, the "Shareholders").

The parties to this Agreement are as follows:
1. Globex International ("Company")
2. Sarah Johnson ("Founder")
3. European Ventures ("Investor A")
4. Tech Growth Fund ("Investor B")

The parties agree to the following terms:
- Initial investment of £3M from Investor A on April 1, 2023
- Secondary investment of £7M from Investor B on May 20, 2023
- Board meeting scheduled for the second Tuesday of each quarter
- Annual shareholder meeting on June 30, 2023
- Company valuation set at £35M post-money

This Agreement shall be governed by the laws of England and Wales.`,
      tags: ['documentType:Shareholder Agreement', 'dealStage:Executed', 'parties:Globex International', 'dealSize:$10M-$50M', 'jurisdiction:UK']
    },
    {
      id: 'doc3',
      name: 'Deal 3 - Subscription Agreement',
      content: `SUBSCRIPTION AGREEMENT

This Subscription Agreement (the "Agreement") is made and entered into as of May 5, 2023 (the "Effective Date"), by and between Initech Solutions, a California corporation (the "Company"), and Venture Partners LLC ("Investor").

The parties to this Agreement are as follows:
1. Initech Solutions ("Company")
2. Venture Partners LLC ("Investor")

The parties agree to the following terms:
- Investment amount: $2.5M
- Closing date: June 15, 2023
- Share price: $10 per share
- Number of shares: 250,000
- Use of proceeds: Product development and market expansion
- Board observer rights granted to Investor

This Agreement shall be governed by the laws of the State of California.`,
      tags: ['documentType:Subscription Agreement', 'dealStage:Final', 'parties:Initech Solutions', 'dealSize:$1M-$5M', 'jurisdiction:US']
    }
  ];
  
  // Filter sample documents by the provided IDs
  // In a real implementation, you would query your database
  return sampleDocuments.filter(doc => documentIds.includes(doc.id));
}

// Prepare context for the LLM from multiple documents
function prepareContext(documents) {
  let context = '';
  
  documents.forEach((doc, index) => {
    context += `DOCUMENT ${index + 1}: ${doc.name}\n\n${doc.content}\n\n`;
    
    // Add document metadata
    context += `Document Tags: ${doc.tags.join(', ')}\n\n`;
    
    // Add separator between documents
    if (index < documents.length - 1) {
      context += '---\n\n';
    }
  });
  
  return context;
} 