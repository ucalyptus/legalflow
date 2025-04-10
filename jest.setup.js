require('@testing-library/jest-dom');
require('jest-environment-jsdom');

// Load environment variables
require('dotenv').config();

// Mock fetch globally
global.fetch = jest.fn((url) => {
  return Promise.resolve({
    status: 200,
    ok: true,
    json: () => Promise.resolve({
      success: true,
      dateEventTable: [
        {
          date: "2024-01-26",
          event: "Test event",
          status: "completed",
          page: 1,
          citation: "Test citation"
        }
      ]
    }),
    text: () => Promise.resolve("Test response")
  });
});

// Reset all mocks before each test
beforeEach(() => {
  jest.resetAllMocks();
}); 