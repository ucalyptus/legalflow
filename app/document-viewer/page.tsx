'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../components/layout';
import { useRouter } from 'next/navigation';

export default function DocumentViewer() {
  const [document, setDocument] = useState<string>('');
  const [documentPreview, setDocumentPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getFirstHundredWords = (text: string): string => {
    try {
      // Remove any non-printable characters and excessive whitespace
      const cleanText = text.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim();
      const words = cleanText.split(/\s+/);
      return words.slice(0, 100).join(' ') + (words.length > 100 ? '...' : '');
    } catch (error) {
      console.error('Error processing text preview:', error);
      return 'Error: Unable to generate preview. The document may be in an unsupported format.';
    }
  };

  const fetchDraft = async () => {
    setLoading(true);
    setError(null);

    try {
      const settings = localStorage.getItem('draftSettings');
      const templateText = localStorage.getItem('templateText');
      const mimeType = localStorage.getItem('documentMimeType') || '';

      if (!settings) {
        throw new Error('No settings found');
      }

      const parsedSettings = JSON.parse(settings);
      
      // Set document preview
      if (templateText) {
        try {
          // First try to decode as base64
          const decodedText = Buffer.from(templateText, 'base64').toString('utf-8');
          // Check if the decoded text looks like binary data
          if (decodedText.includes('[Content_Types].xml') || /[\x00-\x08\x0B-\x0C\x0E-\x1F]/.test(decodedText)) {
            setDocumentPreview('Processing document for extraction...');
          } else {
            setDocumentPreview(getFirstHundredWords(decodedText));
          }
        } catch (error) {
          console.error('Error decoding document:', error);
          setDocumentPreview('Processing document for extraction...');
        }
      }
      
      if (parsedSettings.type === 'Extract') {
        // Handle extraction
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentText: templateText,
            mimeType: mimeType,
            model: parsedSettings.model,
            apiType: parsedSettings.apiType,
            extractionTypes: parsedSettings.extractions
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to extract information');
        }

        const data = await response.json();
        
        if (data.status === 'error') {
          throw new Error(data.error || 'Extraction failed');
        }

        // Format the extracted data into HTML
        const formattedContent = formatExtractionResults(data.data);
        setDocument(formattedContent);
      } else {
        // Handle regular draft generation
        const response = await fetch('/api/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            settings: parsedSettings,
            templateText
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate document');
        }

        const data = await response.json();
        setDocument(data.content);
      }
    } catch (error) {
      console.error('Error in fetchDraft:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setDocument('');
    } finally {
      setLoading(false);
    }
  };

  // Function to format extraction results into HTML
  const formatExtractionResults = (data: any) => {
    const { dateEventTable } = data;
    
    // Sort dates by status
    const completedDates = dateEventTable.filter((item: any) => item.status === 'completed');
    const pendingDates = dateEventTable.filter((item: any) => item.status === 'pending');
    const scheduledDates = dateEventTable.filter((item: any) => item.status === 'scheduled');
    
    return `
      <div class="space-y-8">
        <div class="bg-blue-50 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-4">Timeline Overview</h2>
          <div class="space-y-4">
            <div>
              <h3 class="font-medium text-blue-800">Completed Events</h3>
              <ul class="list-disc pl-5 mt-2">
                ${completedDates.map((item: any) => `
                  <li><strong>${item.date}</strong>: ${item.event}</li>
                `).join('')}
              </ul>
            </div>
            <div>
              <h3 class="font-medium text-blue-800">Pending Events</h3>
              <ul class="list-disc pl-5 mt-2">
                ${pendingDates.map((item: any) => `
                  <li><strong>${item.date}</strong>: ${item.event}</li>
                `).join('')}
              </ul>
            </div>
            <div>
              <h3 class="font-medium text-blue-800">Scheduled Events</h3>
              <ul class="list-disc pl-5 mt-2">
                ${scheduledDates.map((item: any) => `
                  <li><strong>${item.date}</strong>: ${item.event}</li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    fetchDraft();
  }, []);

  const handleRetry = () => {
    fetchDraft();
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {documentPreview && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Document Preview</h3>
                <p className="text-gray-700">{documentPreview}</p>
              </div>
            )}
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: document }}></div>
          </>
        )}
      </div>
    </Layout>
  );
} 