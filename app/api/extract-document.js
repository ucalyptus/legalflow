// API endpoint to extract document text using either LlamaParse or Mistral
// This is called before the dates and events extraction

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentId, extractionType } = req.body;

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    if (!['LlamaParse', 'Mistral'].includes(extractionType)) {
      return res.status(400).json({ error: 'Invalid extraction type. Must be LlamaParse or Mistral' });
    }

    console.log(`Extracting document ${documentId} with ${extractionType}`);

    // Here you would implement the actual extraction logic
    // This would typically involve calling the LlamaParse or Mistral API
    // For now, we'll simulate the extraction process
    
    let extractedText;
    
    // Simulate different processing times for different extraction methods
    await new Promise(resolve => setTimeout(resolve, extractionType === 'LlamaParse' ? 2000 : 3000));
    
    // In a real implementation, you would fetch the document and process it
    // For now, we'll return a placeholder response
    extractedText = `This is the extracted text from document ${documentId} using ${extractionType}.
    
    The agreement was signed on January 15, 2023 and will be effective until December 31, 2025.
    
    Key events include:
    - Initial public offering scheduled for March 10, 2024
    - Quarterly board meetings on the first Monday of each quarter
    - Annual shareholder meeting on May 15, 2024
    - Product launch event on September 5, 2024
    
    The company was incorporated on June 12, 2010 and has undergone three rounds of funding:
    - Series A: August 3, 2011
    - Series B: February 28, 2015
    - Series C: November 11, 2019
    
    The merger agreement with XYZ Corp was executed on October 7, 2022 with a closing date of February 1, 2023.`;
    
    return res.status(200).json({
      documentId,
      extractionType,
      text: extractedText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error extracting document:', error);
    return res.status(500).json({ error: 'Failed to extract document', details: error.message });
  }
} 