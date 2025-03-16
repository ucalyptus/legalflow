import { useState, useEffect } from 'react';
import DocumentExtractor from './DocumentExtractor';

export default function DocumentViewer({ documentId }) {
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [extractionResults, setExtractionResults] = useState(null);
  
  // Function to handle extraction completion
  const handleExtractionComplete = (results) => {
    setExtractionResults(results);
  };
  
  return (
    <div className="document-viewer">
      {/* ... existing document viewer code ... */}
      
      <div className="document-information">
        <h2>Document Information</h2>
        
        <div className="extraction-options">
          <DocumentExtractor 
            documentId={documentId} 
            onExtractComplete={handleExtractionComplete} 
          />
        </div>
        
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
    </div>
  );
} 