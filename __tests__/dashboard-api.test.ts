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

// Model to test
const model = {
  id: "gpt-4-openai",
  name: "GPT-4o (Direct)",
  model: "gpt-4o"
};

describe('Dashboard API Tests', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  // Test extraction API
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

    test(`Extract dates and events using ${model.name}`, async () => {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText: testDocContent,
          model: model.model,
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

  // Test draft API
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

  // Test analysis API
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

    test(`Analyze document using ${model.name}`, async () => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText: testDocContent,
          model: model.model,
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