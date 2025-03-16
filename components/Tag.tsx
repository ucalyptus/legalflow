import React from 'react';

interface TagProps {
  text: string;
  color?: string;
  onDelete?: () => void;
}

const Tag: React.FC<TagProps> = ({ text, color = '#E9ECEF', onDelete }) => {
  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mr-2 mb-2"
      style={{ backgroundColor: color }}
    >
      {text}
      {onDelete && (
        <button
          onClick={onDelete}
          className="ml-1.5 hover:text-red-500"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Tag; 