import { NextResponse, NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

async function checkJobStatus(jobId: string) {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY
  if (!apiKey) throw new Error('LLAMA_CLOUD_API_KEY is not set')

  console.log('Checking status for job:', jobId)

  try {
    const response = await fetch(`https://cloud.llamaindex.ai/api/parse/status/${jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log('Raw status check response:', responseText)

    if (!response.ok) {
      console.error('Status check failed with status:', response.status)
      console.error('Status check response headers:', Object.fromEntries(response.headers.entries()))
      
      // If job not found, return a specific response
      if (response.status === 404) {
        return { status: 'not_found' }
      }
      
      throw new Error(`Failed to check job status: ${response.status} ${response.statusText}\nResponse: ${responseText}`)
    }

    const result = JSON.parse(responseText)
    console.log('Status check result:', result)
    return result
  } catch (error) {
    console.error('Error in checkJobStatus:', error)
    throw error
  }
}

async function getResults(jobId: string) {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY
  if (!apiKey) throw new Error('LLAMA_CLOUD_API_KEY is not set')

  console.log('Getting results for job:', jobId)

  const response = await fetch(`https://cloud.llamaindex.ai/api/parse/result/${jobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Results error response:', errorText)
    throw new Error(`Failed to fetch results: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('Results data:', data)
  return data.text || data.content || data.result
}

function extractRelevantInfo(content: string) {
  interface DocumentInfo {
    caseNumber: string;
    date: string;
    parties: string[];
    advocates: string[];
    summary: string;
  }

  const info: DocumentInfo = {
    caseNumber: '',
    date: '',
    parties: [],
    advocates: [],
    summary: ''
  }

  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.match(/FAT No\.|CAN/)) info.caseNumber = line
    if (line.match(/\d{1,2}(?:st|nd|rd|th)?\s+\w+,?\s+\d{4}/)) info.date = line
    if (line.match(/vs\.|versus/i)) {
      const prevLine = lines[i-1]?.replace(/[#\d\.]/g, '').trim() || ''
      const nextLine = lines[i+1]?.replace(/[#\d\.]/g, '').trim() || ''
      if (prevLine) info.parties.push(prevLine)
      if (nextLine) info.parties.push(nextLine)
    }
    if (line.includes('...for the')) {
      const advocate = lines[i-1]?.replace(/[#\d\.]/g, '').trim()
      if (advocate) info.advocates.push(advocate)
    }
  }

  // Get summary from the numbered points
  const summaryLines = lines.filter(l => /^\d+\./.test(l))
  info.summary = summaryLines.join('\n')

  return info
}

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('id')

    console.log('Received status check request with params:', Object.fromEntries(request.nextUrl.searchParams.entries()))

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    console.log('Checking status for job ID:', jobId)

    const status = await checkJobStatus(jobId)
    console.log('Status check response:', status)

    // Handle not found status
    if (status.status === 'not_found') {
      return NextResponse.json({
        status: 'error',
        error: 'Job not found or expired. Please upload the document again.'
      }, { status: 404 })
    }

    if (status.status === 'SUCCESS' || status.status === 'COMPLETED') {
      try {
        console.log('Job completed, fetching results...')
        const content = await getResults(jobId)
        console.log('Got results, extracting info...')
        const extractedInfo = extractRelevantInfo(content)
        
        return NextResponse.json({
          status: 'completed',
          results: extractedInfo
        })
      } catch (error) {
        console.error('Error getting results:', error)
        return NextResponse.json({
          status: 'error',
          error: 'Failed to get results. Please try uploading the document again.'
        }, { status: 500 })
      }
    }

    if (status.status === 'FAILED') {
      return NextResponse.json({ 
        status: 'failed',
        error: 'Document processing failed. Please try uploading again.'
      })
    }

    // If not completed or failed, it's still processing
    return NextResponse.json({ 
      status: 'processing',
      message: `Job ${jobId} is still processing`
    })

  } catch (error) {
    console.error('Detailed error in GET handler:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to check status',
        message: 'Please try uploading the document again.'
      },
      { status: 500 }
    )
  }
} 