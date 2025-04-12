'use client';

import React, { useState, useEffect } from 'react';
import { FileText, User2, PenLine, Send, ChevronDown } from 'lucide-react';
import Layout from '../components/layout';
import { useRouter } from 'next/navigation';

// Type declaration for File System Access API
declare global {
  interface Window {
    showOpenFilePicker(options?: {
      multiple?: boolean;
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }): Promise<FileSystemFileHandle[]>;
  }
}

interface FileSystemFileHandle {
  getFile(): Promise<File>;
}

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
  mimeType?: string;
  document?: string;
  documentMimeType?: string;
}

export default function DashboardPage() {
  const [agreementDropdownOpen, setAgreementDropdownOpen] = useState(false);
  const [draftDropdownOpen, setDraftDropdownOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState("Writ Affidavit");
  const [selectedDraftType, setSelectedDraftType] = useState("Draft");
  const [formData, setFormData] = useState<FormData>({
    selectedModel: 'gpt-4o',
    companyName: '',
    contactPerson: '',
    instructions: 'Please draft a detailed affidavit covering the following points:\n1. Clear statement of facts\n2. Personal knowledge verification\n3. Purpose of the affidavit\n4. Supporting evidence or documents if any\n5. Proper notarization details'
  });
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const extractionTypes = ['Dates and Events'];
  const [selectedExtractions, setSelectedExtractions] = useState(extractionTypes);

  // Loading state texts
  const loadingStates = {
    PREPARING: 'Converting document to text...',
    PROCESSING: 'Extracting information with GPT-4...',
    FORMATTING: 'Processing extracted information...',
    SAVING: 'Preparing results...'
  };

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

  const renderLayoutBasedOnType = () => {
    switch (selectedDraftType) {
      case 'Draft':
        return (
          <>
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
              <h3 className="text-lg font-medium mb-2">Custom Instructions (Optional)</h3>
              <textarea
                className="w-full h-32 p-2 border rounded-md"
                placeholder="Enter any special instructions or requirements... (optional)"
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </div>
          </>
        );

      case 'Extract':
        return (
          <>
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
              <h3 className="text-lg font-medium mb-2">Custom Instructions (Optional)</h3>
              <textarea
                className="w-full h-32 p-2 border rounded-md"
                placeholder="Enter any specific details about the dates or events you want to extract... (optional)"
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </div>
          </>
        );

      case 'Analyze':
        return (
          <>
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
              <h3 className="text-lg font-medium mb-2">Custom Instructions (Optional)</h3>
              <textarea
                className="w-full h-32 p-2 border rounded-md"
                placeholder="Enter what aspects of the document you want to analyze... (optional)"
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
    reader.onload = (e) => {
      const base64 = e.target?.result?.toString().split(',')[1];
      setFormData({ 
        ...formData, 
        templateFile: base64,
        mimeType: file.type // Store the MIME type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.templateFile && !formData.document) {
        alert("Please upload a document first");
        return;
      }

      setLoadingText(loadingStates.PREPARING);

      if (selectedDraftType === 'Extract') {
        // First show document conversion state
        setLoadingText(loadingStates.PREPARING);
        
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentText: formData.templateFile || formData.document,
            mimeType: formData.mimeType || formData.documentMimeType,
            model: formData.selectedModel?.replace('o', ''),
            instructions: formData.instructions || ''
          }),
        });

        // After 2 seconds (typical conversion time), show processing state
        setTimeout(() => {
          setLoadingText(loadingStates.PROCESSING);
        }, 2000);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to extract information');
        }

        setLoadingText(loadingStates.FORMATTING);
        const data = await response.json();
        console.log('Extraction API response:', data);
        
        try {
          setLoadingText(loadingStates.SAVING);
          localStorage.setItem('extractionResults', JSON.stringify({
            dateEventTable: data.dateEventTable || [],
            type: 'Extract'
          }));
          router.push('/document-viewer');
        } catch (storageError) {
          console.error('Error storing results:', storageError);
          throw new Error('Failed to store extraction results');
        }
      } else if (selectedDraftType === 'Draft') {
        setLoadingText(loadingStates.PROCESSING);
        
        // Call draft endpoint directly
        const response = await fetch('/api/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template: selectedAgreement,
            model: formData.selectedModel?.replace('o', ''),
            companyName: formData.companyName || '',
            contactPerson: formData.contactPerson || '',
            instructions: formData.instructions || '',
            referenceDoc: formData.templateFile || formData.document || ''
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate document');
        }

        setLoadingText(loadingStates.FORMATTING);
        const data = await response.json();
        console.log('Draft API response:', data);
        
        try {
          setLoadingText(loadingStates.SAVING);
          localStorage.setItem('draftSettings', JSON.stringify({
            content: data.content,
            type: 'Draft'
          }));
          router.push('/document-viewer');
        } catch (storageError) {
          console.error('Error storing draft:', storageError);
          throw new Error('Failed to store draft');
        }
      } else {
        // For Analyze type
        const data = {
          type: selectedDraftType,
          model: formData.selectedModel,
          templateFile: formData.templateFile || formData.document,
          mimeType: formData.mimeType || formData.documentMimeType,
          instructions: formData.instructions || ''
        };

        try {
          localStorage.setItem('draftSettings', JSON.stringify(data));
          router.push('/document-viewer');
        } catch (storageError) {
          console.error('Error storing analysis settings:', storageError);
          throw new Error('Failed to store analysis settings');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  // Pre-select document on mount
  useEffect(() => {
    const loadDocument = async () => {
      try {
        // Get the file handle with proper starting directory
        const [fileHandle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: 'Word Documents',
              accept: {
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/msword': ['.doc']
              }
            },
            {
              description: 'PDF Documents',
              accept: {
                'application/pdf': ['.pdf']
              }
            }
          ],
          startIn: 'documents'  // Start in user's Documents folder
        });

        const file = await fileHandle.getFile();
        const reader = new FileReader();

        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            document: base64String.split(',')[1],
            documentMimeType: file.type
          }));
        };

        reader.readAsDataURL(file);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error loading document:', error.message);
        } else {
          console.error('Error loading document:', error);
        }
        // Don't show error to user since they might have just cancelled the picker
      }
    };

    loadDocument();
  }, []);

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
                disabled={loading}
                className={`hover:bg-gray-100 p-2 rounded-full transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Send className="w-6 h-6 text-black" />
              </button>
            </div>

            {/* Loading Overlay */}
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-lg font-semibold text-gray-800">{loadingText}</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Layout based on selected type */}
            {renderLayoutBasedOnType()}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? loadingText : 
                  selectedDraftType === 'Draft' ? 'Generate Document' : 
                  selectedDraftType === 'Extract' ? 'Extract Information' : 'Analyze Document'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 