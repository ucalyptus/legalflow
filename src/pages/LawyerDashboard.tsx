import React from 'react';
import DraftingInterface from '../components/DraftingInterface';

const LawyerDashboard: React.FC = () => {
  const handleTemplateClick = () => {
    // Handle template selection
    console.log('Template clicked');
  };

  const handleClientDetailsClick = () => {
    // Handle client details
    console.log('Client details clicked');
  };

  const handleCustomInstructionsClick = () => {
    // Handle custom instructions
    console.log('Custom instructions clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DraftingInterface
        documentType="Shareholders' Agreement"
        onTemplateClick={handleTemplateClick}
        onClientDetailsClick={handleClientDetailsClick}
        onCustomInstructionsClick={handleCustomInstructionsClick}
      />
    </div>
  );
};

export default LawyerDashboard; 