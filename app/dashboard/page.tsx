'use client';

import React, { useState } from 'react';
import { FileText, User2, PenLine, Send, ChevronDown } from 'lucide-react';
import Layout from '../components/layout';
import { useRouter } from 'next/navigation';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  content?: React.ReactNode;
}

interface FormData {
  template?: string;
  companyName?: string;
  contactPerson?: string;
  instructions?: string;
  templateFile?: string;
  selectedModel?: string;
  apiType?: 'google' | 'openrouter';
}

export default function DashboardPage() {
  const [agreementDropdownOpen, setAgreementDropdownOpen] = useState(false);
  const [draftDropdownOpen, setDraftDropdownOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState("Writ Affidavit");
  const [selectedDraftType, setSelectedDraftType] = useState("Draft");
  const [formData, setFormData] = useState<FormData>({});
  const router = useRouter();
  const [selectedExtractions, setSelectedExtractions] = useState<string[]>([]);
  const extractionTypes = ["Dates and Events"];
  const models = [
    {
      id: "gemini-pro-google",
      name: "Gemini Pro (Direct)",
      model: "gemini-pro",
      apiType: "google" as const,
      description: "Direct Google Gemini API"
    },
    {
      id: "gemini-pro-openrouter",
      name: "Gemini-2.5-Pro (OpenRouter)",
      model: "google/gemini-2.5-pro-exp-03-25:free",
      apiType: "openrouter" as const,
      description: "Via OpenRouter API"
    },
    {
      id: "moonlight",
      name: "Moonlight-16B",
      model: "moonshotai/moonlight-16b-a3b-instruct:free",
      apiType: "openrouter" as const,
      description: "Via OpenRouter API"
    },
    {
      id: "deepseek-v3-0324",
      name: "DeepSeek-V3-0324",
      model: "deepseek/deepseek-chat-v3-0324:free",
      apiType: "openrouter" as const,
      description: "Via OpenRouter API"
    },
    {
      id: "qwq-32b",
      name: "QWQ-32B",
      model: "qwen/qwq-32b:free",
      apiType: "openrouter" as const,
      description: "Via OpenRouter API"
    }
  ];

  const [sections, setSections] = useState<Section[]>([
    {
      id: 'template',
      title: 'Template/Document',
      icon: <FileText className="w-5 h-5" />,
      isOpen: false,
      content: (
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="standard"
              name="template"
              className="w-4 h-4 text-blue-600"
              onChange={(e) => setFormData({ ...formData, template: e.target.checked ? 'standard' : undefined })}
            />
            <label htmlFor="standard">Standard Agreement</label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="premium"
              name="template"
              className="w-4 h-4 text-blue-600"
              onChange={(e) => setFormData({ ...formData, template: e.target.checked ? 'premium' : undefined })}
            />
            <label htmlFor="premium">Premium Agreement</label>
          </div>
        </div>
      )
    },
    {
      id: 'client',
      title: 'Client Details',
      icon: <User2 className="w-5 h-5" />,
      isOpen: false,
      content: (
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Company Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="Enter company name"
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Contact Person</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="Enter contact person"
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
          </div>
        </div>
      )
    },
    {
      id: 'instructions',
      title: 'Custom Instructions',
      icon: <PenLine className="w-5 h-5" />,
      isOpen: false,
      content: (
        <div className="p-4 space-y-4">
          <textarea
            className="w-full h-32 p-2 border rounded-md"
            placeholder="Enter any special instructions or requirements..."
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          />
        </div>
      )
    }
  ]);

  const toggleSection = (id: string) => {
    setSections(sections.map(section => ({
      ...section,
      isOpen: section.id === id ? !section.isOpen : section.isOpen
    })));
  };

  const agreements = [
    "Writ Affidavit",
    "Shareholders' Agreement",
    "Share Subscription Agreement",
    "Board Resolution",
    "Memorandum of Association",
    "Articles of Association",
    "Non-Disclosure Agreement",
    "ROC Filling Forms",
    "Legal Notice"
  ];

  const draftTypes = [
    "Draft",
    "Extract",
    "Analyze",
  ];

  const renderModelSelection = () => (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Select Model</h3>
      <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
        {models.map((model) => (
          <div key={model.id} className="flex items-center group">
            <input
              type="radio"
              id={model.id}
              name="model-selection"
              value={model.model}
              onChange={(e) => setFormData({ 
                ...formData, 
                selectedModel: e.target.value,
                apiType: model.apiType
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="ml-2">
              <label htmlFor={model.id} className="text-gray-700 font-medium">
                {model.name}
              </label>
              <p className="text-gray-500 text-sm">{model.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLayoutBasedOnType = () => {
    switch (selectedDraftType) {
      case 'Draft':
        return (
          <>
            {renderModelSelection()}
            <div className="relative mb-6">
              <button
                onClick={() => setAgreementDropdownOpen(!agreementDropdownOpen)}
                className="w-full bg-gray-100 px-4 py-2 rounded-lg flex items-center justify-between hover:bg-gray-200 transition-colors duration-200"
              >
                <span className="text-gray-800 font-medium">{selectedAgreement}</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
              {agreementDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl border shadow-lg z-20">
                  <div className="py-2">
                    {agreements.map((agreement) => (
                      <button
                        key={agreement}
                        onClick={() => {
                          setSelectedAgreement(agreement);
                          setAgreementDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-200"
                      >
                        {agreement}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Reference Document</h3>
              <input
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Custom Instructions</h3>
              <textarea
                className="w-full h-32 p-2 border rounded-md"
                placeholder="Enter any special instructions or requirements..."
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </div>
          </>
        );

      case 'Extract':
        return (
          <>
            {renderModelSelection()}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Select Items to Extract</h3>
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                {extractionTypes.map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={type}
                      checked={selectedExtractions.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExtractions([...selectedExtractions, type]);
                        } else {
                          setSelectedExtractions(selectedExtractions.filter(item => item !== type));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={type} className="ml-2 text-gray-700">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Upload Document</h3>
              <input
                type="file"
                accept=".docx,.pdf"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Custom Instructions</h3>
              <textarea
                className="w-full h-32 p-2 border rounded-md"
                placeholder="Enter any specific details about the dates or events you want to extract..."
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </div>
          </>
        );

      case 'Analyze':
        return (
          <>
            {renderModelSelection()}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Upload Document</h3>
              <input
                type="file"
                accept=".docx,.pdf"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Custom Instructions</h3>
              <textarea
                className="w-full h-32 p-2 border rounded-md"
                placeholder="Enter what aspects of the document you want to analyze..."
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </div>
          </>
        );
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result?.toString().split(',')[1];
      setFormData({ ...formData, templateFile: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.selectedModel || !formData.apiType) {
      alert("Please select a model to proceed");
      return;
    }
    
    const data = {
      type: selectedDraftType,
      agreement: selectedAgreement,
      extractions: selectedDraftType === 'Extract' ? selectedExtractions : undefined,
      model: formData.selectedModel,
      apiType: formData.apiType,
      ...formData
    };

    // Download JSON
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agreement-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Store data in localStorage instead of URL params
    localStorage.setItem('draftSettings', jsonString);
    if (formData.templateFile) {
      localStorage.setItem('templateText', formData.templateFile);
    }

    // Navigate to document viewer without query params
    router.push('/document-viewer');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="relative">
                <button
                  onClick={() => setDraftDropdownOpen(!draftDropdownOpen)}
                  className="bg-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors duration-200"
                >
                  <span className="text-gray-600">{selectedDraftType}</span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
                {draftDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl border shadow-lg z-20">
                    <div className="py-2">
                      {draftTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setSelectedDraftType(type);
                            setDraftDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-200"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                className="hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
              >
                <Send className="w-6 h-6 text-black" />
              </button>
            </div>

            {/* Dynamic Layout based on selected type */}
            {renderLayoutBasedOnType()}

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                {selectedDraftType === 'Draft' ? 'Generate Document' : 
                 selectedDraftType === 'Extract' ? 'Extract Information' : 'Analyze Document'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 