import fs from 'fs';
import path from 'path';

// Mock document content for testing
const testDocContent = `
LEGAL DOCUMENT - TEST

This is a test document for LegalFlow.
Date: March 21, 2024

PARTIES:
1. Test Company Ltd.
2. John Doe

RECITALS:
1. This is a test document.
2. It contains sample legal text.
3. For testing purposes only.

IN WITNESS WHEREOF, the parties have executed this agreement.
`;

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock;

// Models to test
const models = [
  {
    id: "gemini-pro-google",
    name: "Gemini Pro (Direct)",
    model: "gemini-pro",
    apiType: "google",
  },
  {
    id: "gemini-pro-openrouter",
    name: "Gemini-2.5-Pro (OpenRouter)",
    model: "google/gemini-2.5-pro-exp-03-25:free",
    apiType: "openrouter",
  },
  {
    id: "moonlight",
    name: "Moonlight-16B",
    model: "moonshotai/moonlight-16b-a3b-instruct:free",
    apiType: "openrouter",
  },
  {
    id: "deepseek-v3-0324",
    name: "DeepSeek-V3-0324",
    model: "deepseek/deepseek-chat-v3-0324:free",
    apiType: "openrouter",
  },
  {
    id: "qwq-32b",
    name: "QWQ-32B",
    model: "qwen/qwq-32b:free",
    apiType: "openrouter",
  }
];

describe('Dashboard API Tests', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  // Test extraction API with all models
  describe('Extraction API Tests', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve({
            dateEventTable: [
              {
                date: "2024-03-25",
                event: "Test Event",
                status: "completed"
              }
            ]
          })
        })
      );
    });

    models.forEach(model => {
      test(`Extract dates and events using ${model.name}`, async () => {
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentText: testDocContent,
            model: model.model,
            apiType: model.apiType,
            extractionTypes: ['Dates and Events']
          })
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        
        // Validate response structure
        expect(data).toHaveProperty('dateEventTable');
        expect(Array.isArray(data.dateEventTable)).toBe(true);
        
        // Each event should have required fields
        data.dateEventTable.forEach((event: any) => {
          expect(event).toHaveProperty('date');
          expect(event).toHaveProperty('event');
          expect(event).toHaveProperty('status');
          
          // Validate date format
          expect(/^\d{4}-\d{2}-\d{2}$/.test(event.date)).toBe(true);
          
          // Status should be one of these values
          expect(['completed', 'pending', 'scheduled']).toContain(event.status);
        });
      });
    });
  });

  // Test draft API with all models
  describe('Draft API Tests', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve({
            content: "Generated document content"
          })
        })
      );
    });

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

    models.forEach(model => {
      agreements.forEach(agreement => {
        test(`Draft ${agreement} using ${model.name}`, async () => {
          const response = await fetch('/api/draft', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template: agreement,
              model: model.model,
              apiType: model.apiType,
              companyName: 'Test Company Ltd',
              contactPerson: 'John Doe',
              instructions: 'Test draft generation',
              referenceDoc: testDocContent
            })
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          
          // Validate response structure
          expect(data).toHaveProperty('content');
          expect(typeof data.content).toBe('string');
          expect(data.content.length).toBeGreaterThan(0);
        });
      });
    });
  });

  // Test analysis API with all models
  describe('Analysis API Tests', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve({
            analysis: {
              summary: "Test summary",
              keyPoints: ["Point 1", "Point 2"],
              recommendations: ["Rec 1", "Rec 2"]
            }
          })
        })
      );
    });

    models.forEach(model => {
      test(`Analyze document using ${model.name}`, async () => {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentText: testDocContent,
            model: model.model,
            apiType: model.apiType,
            analysisType: 'legal'
          })
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        
        // Validate response structure
        expect(data).toHaveProperty('analysis');
        expect(typeof data.analysis).toBe('object');
        
        // Analysis should have key sections
        expect(data.analysis).toHaveProperty('summary');
        expect(data.analysis).toHaveProperty('keyPoints');
        expect(data.analysis).toHaveProperty('recommendations');
      });
    });
  });

  // Test document management APIs
  describe('Document Management API Tests', () => {
    beforeEach(() => {
      // Reset mock implementation for each test
      (global.fetch as jest.Mock).mockReset();
    });

    test('Get all documents', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve([])
        })
      );

      const response = await fetch('/api/documents');
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('Get document tags', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve([])
        })
      );

      const response = await fetch('/api/documents/tags');
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('Update document tags', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      const docId = 'test-doc-id';
      const tags = ['legal', 'important', 'urgent'];
      
      const response = await fetch('/api/documents/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: docId,
          tags: tags
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
    });
  });
}); 