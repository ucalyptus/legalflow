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
    try {
      setLoading(true);
      setError(null);
      
      // Get data from localStorage
      const settingsString = localStorage.getItem('draftSettings');
      const templateText = localStorage.getItem('templateText');
      
      console.log('Settings from localStorage:', settingsString);
      
      if (!settingsString) {
        throw new Error('No settings found. Please return to the dashboard and try again.');
      }

      const settings = JSON.parse(settingsString);
      
      console.log('Sending request to /api/draft with settings:', settings);
      
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings,
          templateText,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate draft');
      }
      
      if (!data.content) {
        throw new Error('No content received from the API');
      }

      setDocument(data.content);
      console.log('Document content set:', data.content);

      // Clean up localStorage after successful fetch
      localStorage.removeItem('draftSettings');
      localStorage.removeItem('templateText');
    } catch (error) {
      console.error('Error in fetchDraft:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setDocument('');
    } finally {
      setLoading(false);
    }
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