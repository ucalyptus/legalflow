'use client';

import React, { useState } from 'react';
import DraftingInterface from '../components/DraftingInterface';
import Layout from '../components/layout';

export default function DashboardPage() {
  const [clientDetails, setClientDetails] = useState(null);
  const [customInstructions, setCustomInstructions] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateClick = () => {
    console.log('Template clicked');
  };

  const handleClientDetailsClick = () => {
    console.log('Client details clicked');
  };

  const handleCustomInstructionsClick = () => {
    console.log('Custom instructions clicked');
  };

  const handleSendDocument = () => {
    console.log('Send document clicked');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <DraftingInterface
          documentType="Shareholders' Agreement"
          onTemplateClick={handleTemplateClick}
          onClientDetailsClick={handleClientDetailsClick}
          onCustomInstructionsClick={handleCustomInstructionsClick}
          onSendDocument={handleSendDocument}
          clientDetails={clientDetails}
          customInstructions={customInstructions}
          selectedTemplate={selectedTemplate}
        />
      </div>
    </Layout>
  );
} 