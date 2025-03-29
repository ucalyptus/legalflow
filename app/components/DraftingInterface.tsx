'use client';

import React from 'react';
import { FiFileText, FiUser, FiEdit, FiSend, FiCheck } from 'react-icons/fi';

interface ClientDetails {
  name?: string;
  company?: string;
  email?: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
}

interface DraftingInterfaceProps {
  documentType: string;
  onTemplateClick: () => void;
  onClientDetailsClick: () => void;
  onCustomInstructionsClick: () => void;
  onSendDocument: () => void;
  clientDetails: ClientDetails | null;
  customInstructions: string;
  selectedTemplate: Template | null;
}

const DraftingInterface: React.FC<DraftingInterfaceProps> = ({
  documentType,
  onTemplateClick,
  onClientDetailsClick,
  onCustomInstructionsClick,
  onSendDocument,
  clientDetails,
  customInstructions,
  selectedTemplate,
}) => {
  const getStatusIcon = (item: any) => {
    if (item) {
      return <FiCheck className="w-4 h-4 text-green-500" />;
    }
    return null;
  };

  return (
    <div className="relative w-[1124px] mx-auto mt-8">
      {/* Main container */}
      <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
        {/* Header section */}
        <div className="flex items-center gap-4 mb-16">
          {/* Draft text */}
          <div className="bg-[#F1F1F1] rounded-[16px] px-6 py-3">
            <span className="font-['IBM_Plex_Sans'] text-[24px] text-[rgba(0,0,0,0.8)]">
              Draft
            </span>
          </div>
          
          {/* "a" text */}
          <span className="font-['IBM_Plex_Sans'] text-[24px] text-[rgba(0,0,0,0.8)]">
            a
          </span>

          {/* Document type text */}
          <div className="bg-[#F1F1F1] rounded-[16px] px-6 py-3">
            <span className="font-['IBM_Plex_Sans'] text-[24px] text-[rgba(0,0,0,0.8)]">
              {documentType}
            </span>
          </div>

          {/* Send button */}
          <button 
            onClick={onSendDocument}
            className="absolute right-8 w-[48px] h-[48px] bg-black rounded-[12px] flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <FiSend className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Add section */}
        <div>
          <span className="font-['IBM_Plex_Sans'] font-bold text-[20px] text-[rgba(0,0,0,0.8)] mb-6 block">
            Add:
          </span>
          <div className="flex gap-6">
            {/* Template/Document button */}
            <button
              onClick={onTemplateClick}
              className="group flex items-center gap-3 bg-white rounded-[16px] px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <FiFileText className="w-6 h-6 text-[rgba(0,0,0,0.54)]" />
                <span className="font-['IBM_Plex_Sans'] text-[18px] text-[rgba(0,0,0,0.8)]">
                  Template/Document
                </span>
                {getStatusIcon(selectedTemplate)}
              </div>
            </button>

            {/* Client Details button */}
            <button
              onClick={onClientDetailsClick}
              className="group flex items-center gap-3 bg-white rounded-[16px] px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <FiUser className="w-6 h-6 text-[rgba(0,0,0,0.54)]" />
                <span className="font-['IBM_Plex_Sans'] text-[18px] text-[rgba(0,0,0,0.8)]">
                  Client Details
                </span>
                {getStatusIcon(clientDetails)}
              </div>
            </button>

            {/* Custom Instructions button */}
            <button
              onClick={onCustomInstructionsClick}
              className="group flex items-center gap-3 bg-white rounded-[16px] px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <FiEdit className="w-6 h-6 text-[rgba(0,0,0,0.54)]" />
                <span className="font-['IBM_Plex_Sans'] text-[18px] text-[rgba(0,0,0,0.8)]">
                  Custom Instructions
                </span>
                {getStatusIcon(customInstructions)}
              </div>
            </button>
          </div>
        </div>

        {/* Preview section */}
        {(selectedTemplate || clientDetails || customInstructions) && (
          <div className="mt-8 p-6 bg-gray-50 rounded-[16px]">
            <h3 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[rgba(0,0,0,0.8)] mb-4">
              Current Draft Details:
            </h3>
            {selectedTemplate && (
              <div className="mb-3">
                <span className="font-bold">Template:</span> {selectedTemplate.name}
              </div>
            )}
            {clientDetails && (
              <div className="mb-3">
                <span className="font-bold">Client:</span> {clientDetails.name} ({clientDetails.company})
              </div>
            )}
            {customInstructions && (
              <div className="mb-3">
                <span className="font-bold">Instructions:</span> {customInstructions}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftingInterface; 