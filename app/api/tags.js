// API endpoint to fetch all available tags

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real implementation, you would fetch tags from your database
    // For now, we'll return a predefined list of tags
    
    // Simulate database latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Sample tags that might be in the system
    const tags = [
      // Document types
      'documentType:Shareholder Agreement',
      'documentType:Subscription Agreement',
      'documentType:Term Sheet',
      'documentType:NDA',
      'documentType:Employment Agreement',
      
      // Deal stages
      'dealStage:Draft',
      'dealStage:Negotiation',
      'dealStage:Final',
      'dealStage:Executed',
      'dealStage:Terminated',
      
      // Parties
      'parties:Acme Corp',
      'parties:Globex',
      'parties:Initech',
      'parties:Umbrella Corp',
      
      // Deal sizes
      'dealSize:<$1M',
      'dealSize:$1M-$5M',
      'dealSize:$5M-$10M',
      'dealSize:$10M-$50M',
      'dealSize:>$50M',
      
      // Jurisdictions
      'jurisdiction:US',
      'jurisdiction:UK',
      'jurisdiction:EU',
      'jurisdiction:Asia',
      
      // Custom tags
      'urgent',
      'requires-review',
      'confidential',
      'high-priority',
      'pending-signature'
    ];
    
    return res.status(200).json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return res.status(500).json({ error: 'Failed to fetch tags', details: error.message });
  }
} 