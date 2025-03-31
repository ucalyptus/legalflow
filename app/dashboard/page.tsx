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
}

export default function DashboardPage() {
  const [agreementDropdownOpen, setAgreementDropdownOpen] = useState(false);
  const [draftDropdownOpen, setDraftDropdownOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState("Shareholders' Agreement");
  const [selectedDraftType, setSelectedDraftType] = useState("Draft");
  const [formData, setFormData] = useState<FormData>({});
  const router = useRouter();

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
    "Shareholders' Agreement",
    "Share Subscription Agreement",
    "Board Resolution",
    "Memorandum of Association",
    "Articles of Association",
    "Non-Disclosure Agreement",
    "ROC Filling Forms",
    "Writ Affidavit",
    "Legal Notice"
  ];

  const draftTypes = [
    "Draft",
    "Analyze",
    "Extract-Compare",
    "Extract-Focus"
  ];

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
    const data = {
      type: selectedDraftType,
      agreement: selectedAgreement,
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
              <div className="flex items-center space-x-3">
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
                <span className="text-gray-400">a</span>
                <div className="relative">
                  <button
                    onClick={() => setAgreementDropdownOpen(!agreementDropdownOpen)}
                    className="bg-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <span className="text-gray-800 font-medium">{selectedAgreement}</span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                  {agreementDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border shadow-lg z-20">
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
              </div>
              <button
                onClick={handleSubmit}
                className="hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
              >
                <Send className="w-6 h-6 text-black" />
              </button>
            </div>

            {/* Template Upload Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Template Document</h3>
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
              <p className="mt-1 text-sm text-gray-500">
                Upload a .docx template file to use as reference
              </p>
            </div>

            {/* Add Section */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-700 mb-4">Add:</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sections.map(section => (
                  <div key={section.id} className="relative">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full bg-white border rounded-xl p-4 hover:border-blue-500 transition-colors duration-200 shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        {section.icon}
                        <span className="text-gray-700">{section.title}</span>
                      </div>
                    </button>
                    {section.isOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border shadow-lg z-10">
                        {section.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Generate Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 