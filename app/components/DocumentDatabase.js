import { useState, useEffect } from 'react';
import Link from 'next/link';
import DocumentTagger from './DocumentTagger';

export default function DocumentDatabase() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  
  // Columns for the database view
  const columns = [
    { id: 'name', name: 'Document Name', sortable: true },
    { id: 'documentType', name: 'Document Type', filterable: true },
    { id: 'dealStage', name: 'Deal Stage', filterable: true },
    { id: 'parties', name: 'Parties', filterable: true },
    { id: 'dealSize', name: 'Deal Size', filterable: true },
    { id: 'jurisdiction', name: 'Jurisdiction', filterable: true },
    { id: 'uploadDate', name: 'Upload Date', sortable: true },
    { id: 'actions', name: 'Actions' },
  ];
  
  // Fetch documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/documents');
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents);
          setFilteredDocuments(data.documents);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  // Apply filters when activeFilters change
  useEffect(() => {
    if (Object.keys(activeFilters).length === 0) {
      setFilteredDocuments(documents);
      return;
    }
    
    const filtered = documents.filter(doc => {
      // Check if document matches all active filters
      return Object.entries(activeFilters).every(([category, value]) => {
        const categoryTag = `${category}:${value}`;
        return doc.tags && doc.tags.includes(categoryTag);
      });
    });
    
    setFilteredDocuments(filtered);
  }, [activeFilters, documents]);
  
  // Toggle document selection
  const toggleDocumentSelection = (docId) => {
    if (selectedDocuments.includes(docId)) {
      setSelectedDocuments(selectedDocuments.filter(id => id !== docId));
    } else {
      setSelectedDocuments([...selectedDocuments, docId]);
    }
  };
  
  // Open tag modal for a document
  const openTagModal = (document) => {
    setCurrentDocument(document);
    setShowTagModal(true);
  };
  
  // Handle tag updates
  const handleTagsUpdated = (updatedTags) => {
    // Update the document in the local state
    const updatedDocuments = documents.map(doc => 
      doc.id === currentDocument.id ? { ...doc, tags: updatedTags } : doc
    );
    
    setDocuments(updatedDocuments);
    setShowTagModal(false);
  };
  
  // Add or update a filter
  const addFilter = (category, value) => {
    setActiveFilters({
      ...activeFilters,
      [category]: value,
    });
  };
  
  // Remove a filter
  const removeFilter = (category) => {
    const updatedFilters = { ...activeFilters };
    delete updatedFilters[category];
    setActiveFilters(updatedFilters);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
  };
  
  // Submit query to LLM for selected documents
  const submitQuery = async () => {
    if (!queryInput.trim() || selectedDocuments.length === 0) return;
    
    setIsQuerying(true);
    setQueryResult(null);
    
    try {
      const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
      
      const response = await fetch('/api/query-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryInput,
          documentIds: selectedDocuments,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueryResult(data.result);
      } else {
        setQueryResult("Error processing your query. Please try again.");
      }
    } catch (error) {
      console.error('Error querying documents:', error);
      setQueryResult("An error occurred while processing your query.");
    } finally {
      setIsQuerying(false);
    }
  };
  
  // Get value for a specific column from document
  const getColumnValue = (document, columnId) => {
    if (columnId === 'name') {
      return document.name || 'Untitled';
    }
    
    if (columnId === 'uploadDate') {
      return new Date(document.createdAt).toLocaleDateString();
    }
    
    // For tag-based columns, extract the value from the tag
    const tag = document.tags?.find(tag => tag.startsWith(`${columnId}:`));
    return tag ? tag.split(':')[1] : '-';
  };
  
  return (
    <div className="document-database">
      <h2>Document Database</h2>
      
      {/* Active filters */}
      <div className="active-filters">
        <h3>Active Filters</h3>
        {Object.keys(activeFilters).length > 0 ? (
          <div className="filter-tags">
            {Object.entries(activeFilters).map(([category, value]) => (
              <span key={category} className="filter-tag">
                {category}: {value}
                <button 
                  onClick={() => removeFilter(category)}
                  aria-label="Remove filter"
                >
                  ×
                </button>
              </span>
            ))}
            <button 
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <p>No active filters</p>
        )}
      </div>
      
      {/* Selected documents and query interface */}
      <div className="query-section">
        <h3>Query Selected Documents</h3>
        <div className="selected-documents">
          <h4>Selected Documents ({selectedDocuments.length})</h4>
          {selectedDocuments.length > 0 ? (
            <ul>
              {documents
                .filter(doc => selectedDocuments.includes(doc.id))
                .map(doc => (
                  <li key={doc.id}>{doc.name}</li>
                ))}
            </ul>
          ) : (
            <p>No documents selected</p>
          )}
        </div>
        
        <div className="query-input">
          <textarea
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Enter your query about the selected documents..."
            rows={3}
          />
          <button 
            onClick={submitQuery}
            disabled={isQuerying || !queryInput.trim() || selectedDocuments.length === 0}
          >
            {isQuerying ? 'Processing...' : 'Submit Query'}
          </button>
        </div>
        
        {queryResult && (
          <div className="query-result">
            <h4>Query Result</h4>
            <div className="result-content">
              {queryResult}
            </div>
          </div>
        )}
      </div>
      
      {/* Document table */}
      <div className="document-table-container">
        <table className="document-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
                    } else {
                      setSelectedDocuments([]);
                    }
                  }}
                  checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                />
              </th>
              {columns.map(column => (
                <th key={column.id}>
                  {column.name}
                  {column.filterable && (
                    <div className="column-filter">
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            addFilter(column.id, e.target.value);
                          } else {
                            removeFilter(column.id);
                          }
                        }}
                        value={activeFilters[column.id] || ''}
                      >
                        <option value="">All</option>
                        {/* Get unique values for this column */}
                        {Array.from(new Set(
                          documents
                            .map(doc => getColumnValue(doc, column.id))
                            .filter(value => value !== '-')
                        )).map(value => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1}>Loading documents...</td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1}>No documents found</td>
              </tr>
            ) : (
              filteredDocuments.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => toggleDocumentSelection(doc.id)}
                    />
                  </td>
                  {columns.map(column => (
                    <td key={`${doc.id}-${column.id}`}>
                      {column.id === 'name' ? (
                        <Link href={`/documents/${doc.id}`}>
                          {getColumnValue(doc, column.id)}
                        </Link>
                      ) : column.id === 'actions' ? (
                        <div className="document-actions">
                          <button onClick={() => openTagModal(doc)}>
                            Edit Tags
                          </button>
                        </div>
                      ) : (
                        getColumnValue(doc, column.id)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Tag modal */}
      {showTagModal && currentDocument && (
        <div className="tag-modal-overlay">
          <div className="tag-modal">
            <button 
              className="close-modal-btn"
              onClick={() => setShowTagModal(false)}
            >
              ×
            </button>
            <h3>Edit Tags for {currentDocument.name}</h3>
            <DocumentTagger 
              document={currentDocument}
              onTagsUpdated={handleTagsUpdated}
            />
          </div>
        </div>
      )}
    </div>
  );
} 