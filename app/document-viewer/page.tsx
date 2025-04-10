'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../components/layout';
import { useRouter } from 'next/navigation';

export default function DocumentViewer() {
  const [document, setDocument] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchDraft = async () => {
    setLoading(true);
    setError(null);

    try {
      const settings = localStorage.getItem('draftSettings');
      const templateText = localStorage.getItem('templateText');

      if (!settings) {
        throw new Error('No settings found');
      }

      const parsedSettings = JSON.parse(settings);
      
      if (parsedSettings.type === 'Extract') {
        // Handle extraction
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentText: templateText,
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <div className="space-x-4">
                <button
                  onClick={handleRetry}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : document ? (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: document }} />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No content was generated. Please try again.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 