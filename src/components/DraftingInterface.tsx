import React, { useState } from 'react';
import { FiFileText, FiUser, FiEdit, FiHome } from 'react-icons/fi';

interface DraftingInterfaceProps {
  documentType: string;
  onTemplateClick: () => void;
  onClientDetailsClick: () => void;
  onCustomInstructionsClick: () => void;
}

const DraftingInterface: React.FC<DraftingInterfaceProps> = ({
  documentType,
  onTemplateClick,
  onClientDetailsClick,
  onCustomInstructionsClick,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [clientName, setClientName] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  const handleTemplateSelect = () => {
    setSelectedTemplate('Template/Document');
    setExpanded(true);
    onTemplateClick();
  };

  const handleClientSelect = () => {
    onClientDetailsClick();
  };

  if (!expanded) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        {/* Initial View */}
        <div className="flex items-center gap-4 mb-8">
          <span className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 font-medium">
            Draft
          </span>
          <span className="text-gray-500">a</span>
          <span className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 font-medium">
            {documentType}
          </span>
        </div>

        <div className="space-y-4">
          <div className="text-gray-700 font-medium">Add:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleTemplateSelect}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FiFileText className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Template/Document</span>
            </button>

            <button
              onClick={handleClientSelect}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FiUser className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Client Details</span>
            </button>

            <button
              onClick={onCustomInstructionsClick}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FiEdit className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Custom Instructions</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto space-y-6">
      {/* Expanded View */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 font-medium">
          Draft
        </span>
        <span className="text-gray-500">a</span>
        <span className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 font-medium">
          {documentType}
        </span>
        <span className="text-gray-500">using</span>
        <span className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 font-medium">
          {selectedTemplate}
        </span>
        <span className="text-gray-500">as a guide, for</span>
        <input
          type="text"
          placeholder="Client Name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 font-medium border-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">Custom Instructions:</span>
        </div>
        <textarea
          placeholder="Add custom instructions here, if any. For example: 'Make sure to include an Arbitration Clause'"
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          className="w-full h-24 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-4">
        <div className="text-gray-700 font-medium">Add:</div>
        <button
          onClick={() => {}}
          className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <FiHome className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700">Jurisdiction</span>
        </button>
      </div>
    </div>
  );
};

export default DraftingInterface; 