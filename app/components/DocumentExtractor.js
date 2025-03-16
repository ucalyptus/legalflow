import { useState } from 'react';

export default function DocumentExtractor({ documentId, onExtractComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [extractionResults, setExtractionResults] = useState(null);
  const [error, setError] = useState(null);

  // Function to handle extraction with either LlamaParse or Mistral
  const handleExtraction = async (extractionType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, extract the document text using the selected extraction method
      const extractionResponse = await fetch(`/api/extract-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          extractionType,
        }),
      });
      
      if (!extractionResponse.ok) {
        throw new Error(`Failed to extract document with ${extractionType}`);
      }
      
      const extractedDocument = await extractionResponse.json();
      
      // Now, extract dates and events from the extracted document text
      const datesEventsResponse = await fetch('/api/extract-dates-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText: extractedDocument.text,
          extractionType,
        }),
      });
      
      if (!datesEventsResponse.ok) {
        throw new Error('Failed to extract dates and events');
      }
      
      const datesEventsData = await datesEventsResponse.json();
      
      setExtractionResults(datesEventsData);
      
      // Call the callback with the results if provided
      if (onExtractComplete) {
        onExtractComplete(datesEventsData);
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="document-extractor">
      <div className="extraction-buttons">
        <button
          className="extraction-button"
          onClick={() => handleExtraction('LlamaParse')}
          disabled={isLoading}
        >
          {isLoading && extractionType === 'LlamaParse' ? 'Processing...' : 'LlamaParse'}
        </button>
        
        <button
          className="extraction-button"
          onClick={() => handleExtraction('Mistral')}
          disabled={isLoading}
        >
          {isLoading && extractionType === 'Mistral' ? 'Processing...' : 'Mistral'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      {extractionResults && (
        <div className="extraction-results">
          <h3>Extracted Dates and Events</h3>
          
          <div className="dates-section">
            <h4>Dates</h4>
            {extractionResults.dates.length > 0 ? (
              <ul>
                {extractionResults.dates.map((date, index) => (
                  <li key={index}>
                    <strong>{date.text}</strong>
                    {date.context && <p>{date.context}</p>}
                    {date.section && <small>Section: {date.section}</small>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No dates found</p>
            )}
          </div>
          
          <div className="events-section">
            <h4>Events</h4>
            {extractionResults.events.length > 0 ? (
              <ul>
                {extractionResults.events.map((event, index) => (
                  <li key={index}>
                    <strong>{event.text}</strong>
                    {event.description && <p>{event.description}</p>}
                    {event.section && <small>Section: {event.section}</small>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No events found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 