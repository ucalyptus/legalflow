import { NextResponse } from 'next/server'
import { extractDocumentInfo } from '@/lib/document-parser'
import { Mistral } from '@mistralai/mistralai'

const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
})

interface DocumentInfo {
  title?: string
  caseNumber?: string
  date?: string
  parties?: string[]
  advocates?: string[]
  summary?: string
  content?: string
  error?: string
}

async function extractWithMistral(url: string): Promise<DocumentInfo> {
  try {
    // Process document with Mistral OCR
    const ocrResponse = await mistralClient.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: url
      }
    })

    if (!ocrResponse || !ocrResponse.pages) {
      throw new Error('Failed to extract text from document')
    }

    // Extract information from OCR results
    const pages = ocrResponse.pages
    let content = ''
    let title = ''
    let date = ''
    const parties: string[] = []
    const advocates: string[] = []
    let summary = ''

    // Process each page
    for (const page of pages) {
      const pageText = page.markdown || ''
      content += pageText + '\n\n'

      // Extract title from first page
      if (page.index === 0) {
        const lines = pageText.split('\n')
        title = lines[0]
      }

      // Extract date
      const dateMatch = pageText.match(/dated\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i)
      if (dateMatch) {
        date = dateMatch[1]
      }

      // Extract parties
      const partyMatches = pageText.match(/(?:BETWEEN|AND)\s+([^,\n]+)(?:,|\n|$)/g)
      if (partyMatches) {
        partyMatches.forEach(match => {
          const party = match.replace(/(?:BETWEEN|AND)\s+/, '').trim()
          if (party && !parties.includes(party)) {
            parties.push(party)
          }
        })
      }

      // Extract advocates
      const advocateMatches = pageText.match(/(?:represented by|advocate)[:\s]+([^,\n]+)(?:,|\n|$)/gi)
      if (advocateMatches) {
        advocateMatches.forEach(match => {
          const advocate = match.replace(/(?:represented by|advocate)[:\s]+/i, '').trim()
          if (advocate && !advocates.includes(advocate)) {
            advocates.push(advocate)
          }
        })
      }

      // Extract summary from table of contents or recitals
      if (pageText.includes('RECITALS:') || pageText.match(/^\d+\.\s+/m)) {
        const summaryLines = pageText.split('\n')
          .filter(line => line.match(/^\d+\.\s+/))
          .map(line => line.trim())
        if (summaryLines.length > 0) {
          summary = summaryLines.join('\n')
        }
      }
    }

    return {
      title,
      date,
      parties,
      advocates,
      summary,
      content
    }

  } catch (error) {
    console.error('Mistral OCR error:', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, method = 'both' } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    let response: {
      status: string,
      results?: {
        content: string | null
      },
      error?: string
    } = {
      status: 'completed',
      results: {
        content: null
      }
    }

    try {
      if (method === 'mistral') {
        const mistralResult = await extractWithMistral(url)
        console.log('Mistral extraction result:', mistralResult)
        response.results!.content = mistralResult.content || null
      } else if (method === 'llamaparse') {
        const llamaparseResult = await extractDocumentInfo(url)
        console.log('LlamaParse extraction result:', llamaparseResult)
        response.results!.content = llamaparseResult.content || null
      } else if (method === 'both') {
        throw new Error('Both providers mode not supported')
      }

      console.log('Sending response:', response)
      return NextResponse.json(response)
    } catch (error) {
      console.error('Extraction error:', error)
      return NextResponse.json({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to extract document'
      }, { status: 500 })
    }

  } catch (error: unknown) {
    console.error('Error in parse-document route:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to parse document'
      },
      { status: 500 }
    )
  }
} 