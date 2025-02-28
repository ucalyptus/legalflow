import { NextResponse } from 'next/server'
import { extractDocumentInfo } from '@/lib/document-parser'

const LLAMA_CLOUD_API_KEY = process.env.LLAMA_CLOUD_API_KEY

if (!LLAMA_CLOUD_API_KEY) {
  console.error('LLAMA_CLOUD_API_KEY is not set in environment variables')
}

interface DocumentInfo {
  caseNumber: string
  date: string
  parties: string[]
  advocates: string[]
  summary: string
}

async function uploadAndParse(url: string) {
  console.log('Starting uploadAndParse with URL:', url)
  
  const apiKey = process.env.LLAMA_CLOUD_API_KEY
  console.log('API Key present:', !!apiKey)
  
  if (!apiKey) {
    console.error('API Key missing!')
    throw new Error('LLAMA_CLOUD_API_KEY is not set')
  }

  try {
    // Download the file
    console.log('Attempting to download file from URL:', url)
    const response = await fetch(url)
    console.log('Download response status:', response.status)
    console.log('Download response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Download failed:', {
        status: response.status,
        statusText: response.statusText,
        response: errorText
      })
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log('File downloaded successfully, size:', arrayBuffer.byteLength)
    
    // Create form data
    const formData = new FormData()
    const blob = new Blob([Buffer.from(arrayBuffer)], { type: 'application/pdf' })
    formData.append('file', blob, 'document.pdf')
    
    // Log request details
    const uploadUrl = 'https://cloud.llamaindex.ai/api/parse'
    console.log('Preparing upload request to:', uploadUrl)
    console.log('Request headers:', {
      'Authorization': 'Bearer [REDACTED]',
      'Accept': 'application/json'
    })
    
    // Use the correct API endpoint
    console.log('Sending upload request...')
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: formData
    })

    console.log('Upload response status:', uploadResponse.status)
    console.log('Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()))

    let responseText
    try {
      responseText = await uploadResponse.text()
      console.log('Raw upload response:', responseText)
    } catch (e) {
      console.error('Failed to read response text:', e)
      responseText = 'Failed to read response'
    }

    if (!uploadResponse.ok) {
      console.error('Upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        response: responseText,
        headers: Object.fromEntries(uploadResponse.headers.entries())
      })
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}\nResponse: ${responseText}`)
    }

    let uploadResult
    try {
      uploadResult = JSON.parse(responseText)
      console.log('Parsed upload result:', uploadResult)
    } catch (e) {
      console.error('Failed to parse response JSON:', e)
      throw new Error('Failed to parse upload response')
    }
    
    return {
      id: uploadResult.id,
      status: 'PENDING'
    }
  } catch (error) {
    console.error('Detailed error in uploadAndParse:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    throw error
  }
}

async function checkJobStatus(jobId: string) {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY
  if (!apiKey) throw new Error('LLAMA_CLOUD_API_KEY is not set')

  console.log('Checking status for job:', jobId)

  const response = await fetch(`https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Status check error response:', errorText)
    throw new Error(`Failed to check job status: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const result = await response.json()
  console.log('Status check result:', result)
  return { status: result.status || 'PROCESSING' }
}

async function getResults(jobId: string) {
  if (!jobId) {
    throw new Error('No job ID provided')
  }

  const apiKey = process.env.LLAMA_CLOUD_API_KEY
  if (!apiKey) {
    throw new Error('LLAMA_CLOUD_API_KEY is not set')
  }

  try {
    const url = `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}/result/markdown`
    console.log('Fetching results from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    })

    console.log('Results response status:', response.status)
    console.log('Results response headers:', Object.fromEntries(response.headers.entries()))

    let responseText
    try {
      responseText = await response.text()
      console.log('Raw results response:', responseText)
    } catch (e) {
      console.error('Failed to read results response text:', e)
      throw new Error('Failed to read results response')
    }

    if (!response.ok) {
      console.error('Results fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText
      })
      throw new Error(`Failed to fetch results: ${response.status} ${response.statusText}\nResponse: ${responseText}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
      console.log('Parsed results data:', data)
    } catch (e) {
      console.error('Failed to parse results JSON:', e)
      throw new Error('Failed to parse results response as JSON')
    }

    // Handle different response formats
    const content = data.text || data.content || data.result || data
    if (typeof content !== 'string') {
      throw new Error(`Unexpected results format: ${JSON.stringify(data)}`)
    }

    return content
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error getting results:', error.message)
    } else {
      console.error('Error getting results:', error)
    }
    throw error
  }
}

function extractRelevantInfo(content: string): DocumentInfo {
  console.log('Starting content extraction')
  console.log('Content length:', content?.length)
  console.log('Content preview:', content?.substring(0, 100))

  const info: DocumentInfo = {
    caseNumber: '',
    date: '',
    parties: [],
    advocates: [],
    summary: ''
  }

  if (!content) {
    console.warn('No content provided for extraction')
    return info
  }

  const lines = content.split('\n')
  console.log('Number of lines:', lines.length)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Log each line being processed (first 50 chars)
    console.log(`Processing line ${i}: ${line.substring(0, 50)}...`)
    
    if (line.match(/FAT No\.|CAN/)) {
      info.caseNumber = line
      console.log('Found case number:', line)
    }
    
    if (line.match(/\d{1,2}(?:st|nd|rd|th)?\s+\w+,?\s+\d{4}/)) {
      info.date = line
      console.log('Found date:', line)
    }
    
    if (line.match(/vs\.|versus/i)) {
      const prevLine = lines[i-1]?.replace(/[#\d\.]/g, '').trim() || ''
      const nextLine = lines[i+1]?.replace(/[#\d\.]/g, '').trim() || ''
      if (prevLine) {
        info.parties.push(prevLine)
        console.log('Found party 1:', prevLine)
      }
      if (nextLine) {
        info.parties.push(nextLine)
        console.log('Found party 2:', nextLine)
      }
    }
    
    if (line.includes('...for the')) {
      const advocate = lines[i-1]?.replace(/[#\d\.]/g, '').trim()
      if (advocate) {
        info.advocates.push(advocate)
        console.log('Found advocate:', advocate)
      }
    }
  }

  // Get summary from the numbered points
  const summaryLines = lines.filter(l => /^\d+\./.test(l))
  info.summary = summaryLines.join('\n')
  console.log('Found summary points:', summaryLines.length)

  console.log('Extracted info:', info)
  return info
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const extractedInfo = await extractDocumentInfo(url)

    return NextResponse.json({
      status: 'completed',
      results: extractedInfo
    })
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