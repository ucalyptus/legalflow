'use client';

import { useEffect, useState } from 'react';
import Layout from '../components/layout';
import { ArrowLeft, Download, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DocumentData {
  content?: string;
  dateEventTable?: Array<{
    date: string;
    event: string;
    status: string;
    citation?: string;
  }>;
  type?: string;
}

export default function DocumentViewer() {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const extractionResults = localStorage.getItem('extractionResults');
      const draftSettings = localStorage.getItem('draftSettings');
      
      if (extractionResults) {
        // Handle extraction results
        const data = JSON.parse(extractionResults);
        console.log('Extraction results:', data); // Debug log
        setDocumentData(data);
        // Clean up storage
        localStorage.removeItem('extractionResults');
      } else if (draftSettings) {
        // Handle draft settings
        const settings = JSON.parse(draftSettings);
        setDocumentData(settings);
        localStorage.removeItem('draftSettings');
      }
    } catch (error) {
      console.error('Error loading document data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDateEventTableToText = (data: DocumentData): string => {
    if (!data.dateEventTable || data.dateEventTable.length === 0) {
      return 'No events found in the document.';
    }

    // Group events by status
    const eventsByStatus = data.dateEventTable.reduce((acc, event) => {
      const status = event.status || 'unknown';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(event);
      return acc;
    }, {} as Record<string, typeof data.dateEventTable>);

    // Format the text
    let text = 'EXTRACTED EVENTS AND DATES\n\n';
    
    for (const [status, events] of Object.entries(eventsByStatus)) {
      text += `${status.toUpperCase()} EVENTS:\n`;
      text += '----------------------------------------\n';
      events.forEach(event => {
        text += `Date: ${event.date}\n`;
        text += `Event: ${event.event}\n`;
        if (event.citation) {
          text += `Citation: ${event.citation}\n`;
        }
        text += '----------------------------------------\n';
      });
      text += '\n';
    }

    return text;
  };

  const handleCopy = async () => {
    try {
      let textToCopy = '';
      
      if (documentData?.dateEventTable) {
        textToCopy = formatDateEventTableToText(documentData);
      } else {
        textToCopy = documentData?.content || '';
      }

      await navigator.clipboard.writeText(textToCopy);
      
      // Show a temporary success message
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = 'Copied to clipboard!';
      document.body.appendChild(messageDiv);
      
      // Remove the message after 2 seconds
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Show error message
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = 'Failed to copy to clipboard';
      document.body.appendChild(messageDiv);
      
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 2000);
    }
  };

  const handleDownload = () => {
    try {
      let content = '';
      let filename = '';
      
      if (documentData?.dateEventTable) {
        content = formatDateEventTableToText(documentData);
        filename = 'extracted_events.txt';
      } else {
        content = documentData?.content || '';
        filename = 'document.txt';
      }

      const element = document.createElement('a');
      const file = new Blob([content], {type: 'text/plain;charset=utf-8'});
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href); // Clean up the URL object

      // Show success message
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = 'Download started!';
      document.body.appendChild(messageDiv);
      
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      // Show error message
      const messageDiv = document.createElement('div');
      messageDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      messageDiv.textContent = 'Download failed';
      document.body.appendChild(messageDiv);
      
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 2000);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!documentData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">No document data found.</p>
        </div>
      );
    }

    if (documentData.dateEventTable && documentData.dateEventTable.length > 0) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Extracted Events</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentData.dateEventTable.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.event}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md break-words">{item.citation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // For regular document content (Draft or Analysis)
    const content = documentData.content || '';
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="prose max-w-none">
            {/* Split content by newlines and preserve formatting */}
            {content.split('\n').map((line, index) => (
              <p key={index} className={line.trim() === '' ? 'my-4' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex space-x-4">
              <button
                onClick={handleCopy}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
} 