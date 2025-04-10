# LegalFlow

LegalFlow is an AI-powered legal document management system that helps legal professionals draft, extract information from, and analyze legal documents with ease.

## Features

### 1. Document Drafting
- Multiple AI model support (Gemini Pro, OpenRouter models)
- Template-based document generation
- Custom instructions and context support
- Support for various legal document types:
  - Writ Affidavit
  - Shareholders' Agreement
  - Share Subscription Agreement
  - Board Resolution
  - Memorandum of Association
  - Articles of Association
  - Non-Disclosure Agreement
  - ROC Filling Forms
  - Legal Notice

### 2. Information Extraction
- Extract key information from legal documents:
  - Dates and Events
  - Timeline analysis
  - Critical deadlines
  - Legal requirements
- Multiple AI model support for accurate extraction
- Structured JSON output for easy integration

### 3. Document Analysis
- AI-powered document analysis
- Multiple model support for diverse analysis capabilities
- Custom analysis instructions

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Integration**: 
  - Google Gemini Pro (Direct API)
  - OpenRouter API (Multiple Models)
- **Database**: Railway (PostgreSQL)
- **Authentication**: [To be implemented]

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/legalflow.git
cd legalflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Required environment variables:
- `GOOGLE_API_KEY`: For Gemini Pro API
- `OPENROUTER_API_KEY`: For OpenRouter API access
- `DATABASE_URL`: Railway PostgreSQL connection string

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### Document Generation
- `POST /api/draft`
  - Generate legal documents using AI models
  - Supports multiple model types and templates

### Information Extraction
- `POST /api/extract`
  - Extract dates, events, and other key information
  - Structured JSON output
  - Multiple model support

### Document Analysis
- `POST /api/analyze`
  - AI-powered document analysis
  - Custom analysis parameters

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for GPT models
- Google for Gemini Pro
- OpenRouter for model access
- All contributors and users of LegalFlow 