import { useState, useEffect } from 'react';

export default function DocumentTagger({ document, onTagsUpdated }) {
  const [tags, setTags] = useState(document?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Predefined tag categories (can be expanded or made dynamic)
  const tagCategories = [
    { id: 'documentType', name: 'Document Type', options: ['Shareholder Agreement', 'Subscription Agreement', 'Term Sheet', 'NDA', 'Other'] },
    { id: 'dealStage', name: 'Deal Stage', options: ['Draft', 'Negotiation', 'Final', 'Executed', 'Terminated'] },
    { id: 'parties', name: 'Parties', options: [] }, // This would be populated dynamically
    { id: 'dealSize', name: 'Deal Size', options: ['<$1M', '$1M-$5M', '$5M-$10M', '$10M-$50M', '>$50M'] },
    { id: 'jurisdiction', name: 'Jurisdiction', options: ['US', 'UK', 'EU', 'Asia', 'Other'] },
  ];
  
  // Fetch available tags on component mount
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.tags);
        }
      } catch (error) {
        console.error('Error fetching available tags:', error);
      }
    };
    
    fetchAvailableTags();
  }, []);
  
  // Update document tags
  const updateDocumentTags = async () => {
    if (!document?.id) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/documents/${document.id}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags }),
      });
      
      if (response.ok) {
        if (onTagsUpdated) {
          onTagsUpdated(tags);
        }
      } else {
        console.error('Failed to update document tags');
      }
    } catch (error) {
      console.error('Error updating document tags:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      
      // Auto-save tags when a new one is added
      updateDocumentTags();
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    
    // Auto-save tags when one is removed
    updateDocumentTags();
  };
  
  // Add a category tag
  const addCategoryTag = (category, value) => {
    const categoryTag = `${category}:${value}`;
    if (!tags.some(tag => tag.startsWith(`${category}:`))) {
      const updatedTags = [...tags, categoryTag];
      setTags(updatedTags);
      
      // Auto-save tags when a category tag is added
      updateDocumentTags();
    } else {
      // Replace existing category tag
      const updatedTags = tags.map(tag => 
        tag.startsWith(`${category}:`) ? categoryTag : tag
      );
      setTags(updatedTags);
      
      // Auto-save tags when a category tag is updated
      updateDocumentTags();
    }
  };
  
  return (
    <div className="document-tagger">
      <h3>Document Tags</h3>
      
      {/* Display current tags */}
      <div className="current-tags">
        {tags.length > 0 ? (
          <div className="tag-list">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button 
                  className="remove-tag-btn" 
                  onClick={() => removeTag(tag)}
                  aria-label="Remove tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p>No tags added yet</p>
        )}
      </div>
      
      {/* Add new custom tag */}
      <div className="add-tag">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a custom tag"
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
        />
        <button 
          onClick={addTag}
          disabled={!newTag.trim() || isLoading}
        >
          Add Tag
        </button>
      </div>
      
      {/* Category-based tagging */}
      <div className="tag-categories">
        <h4>Categorize Document</h4>
        
        {tagCategories.map((category) => (
          <div key={category.id} className="tag-category">
            <h5>{category.name}</h5>
            <select 
              onChange={(e) => addCategoryTag(category.id, e.target.value)}
              value={tags.find(tag => tag.startsWith(`${category.id}:`))?.split(':')[1] || ''}
            >
              <option value="">Select {category.name}</option>
              {category.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
} 