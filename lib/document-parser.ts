import 'dotenv/config'

const LLAMA_CLOUD_API_KEY = process.env.LLAMA_CLOUD_API_KEY
const BASE_URL = 'https://api.cloud.llamaindex.ai/api'

// Utility function for retrying failed requests
async function retryFetch(url: string, options: RequestInit, maxRetries = 3, delay = 1000): Promise<Response> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      return response
    } catch (error) {
      lastError = error as Error
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message}`)
}

async function uploadAndParse(url: string) {
  // First download the file from the URL
  const response = await retryFetch(url, {})
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
  }
  const blob = await response.blob()
  
  // Create form data
  const formData = new FormData()
  formData.append('file', blob, 'document.pdf')

  // Upload to LlamaParse
  const uploadResponse = await retryFetch(`${BASE_URL}/parsing/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LLAMA_CLOUD_API_KEY}`,
      'Accept': 'application/json',
    },
    body: formData
  })

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()
    console.error('Upload failed with status:', uploadResponse.status)
    console.error('Response headers:', Object.fromEntries(uploadResponse.headers.entries()))
    console.error('Response body:', errorText)
    throw new Error(`Failed to upload to LlamaParse: ${uploadResponse.status} ${uploadResponse.statusText}\nResponse: ${errorText}`)
  }

  const result = await uploadResponse.json()
  
  // Log successful response
  console.log('Upload successful, response:', result)
  
  // Handle both id and job_id in response
  const jobId = result.job_id || result.id
  if (!jobId || typeof jobId !== 'string' || !jobId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error(`Invalid job ID received from server: ${JSON.stringify(result)}`)
  }

  return jobId
}

async function checkJobStatus(jobId: string) {
  if (!jobId || typeof jobId !== 'string' || !jobId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error(`Invalid jobId format: ${jobId}`)
  }

  const response = await retryFetch(`${BASE_URL}/parsing/job/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${LLAMA_CLOUD_API_KEY}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Status check failed with status:', response.status)
    console.error('Response headers:', Object.fromEntries(response.headers.entries()))
    console.error('Response body:', errorText)
    
    // Special handling for 404 not found
    if (response.status === 404) {
      return 'NOT_FOUND'
    }
    
    throw new Error(`Failed to check job status: ${response.status} ${response.statusText}\nResponse: ${errorText}`)
  }

  const result = await response.json()
  console.log('Status check response:', result)
  
  // Handle both direct status and nested status
  const status = typeof result === 'object' ? (result.status || result.state || 'UNKNOWN').toUpperCase() : 'UNKNOWN'
  return status
}

async function getResults(jobId: string) {
  console.log('Getting results for job:', jobId)

  const response = await retryFetch(`${BASE_URL}/parsing/job/${jobId}/result/markdown`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${LLAMA_CLOUD_API_KEY}`,
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
    // If the response is plain text, use it directly
    if (responseText.trim()) {
      console.log('Using raw response text as content')
      return responseText
    }
    console.error('Failed to parse results JSON:', e)
    throw new Error('Failed to parse results response as JSON')
  }

  // Try different response formats
  let content = null
  if (typeof data === 'string') {
    content = data
  } else if (typeof data === 'object') {
    content = data.text || data.content || data.result || data.markdown || data.data
    // If content is nested in a data property
    if (!content && data.data) {
      const nestedData = data.data
      content = nestedData.text || nestedData.content || nestedData.result || nestedData.markdown
    }
  }

  if (!content) {
    console.error('No content found in response:', data)
    throw new Error(`No content found in response: ${JSON.stringify(data)}`)
  }

  console.log('Extracted content length:', content.length)
  console.log('Content preview:', content.substring(0, 200))
  
  return content
}

interface ExtractedInfo {
  title?: string
  date?: string
  parties?: string[]
  advocates?: string[]
  summary?: string
  content?: string
}

function extractTitle(content: string): string {
  // Look for a title at the start of the document
  const lines = content.split('\n')
  const titleLine = lines.find(line => 
    line.trim().length > 0 && 
    !line.startsWith('#') && 
    !line.match(/^[0-9.]+/) &&
    line.length < 100
  )
  return titleLine?.trim() || ''
}

function extractDate(content: string): string {
  // Look for dates in various formats
  const datePatterns = [
    /\d{1,2}(?:st|nd|rd|th)?\s+\w+,?\s+\d{4}/,  // 21st March, 2024
    /\d{1,2}[-/]\d{1,2}[-/]\d{4}/,              // 21-03-2024 or 21/03/2024
    /\w+\s+\d{1,2},?\s+\d{4}/                    // March 21, 2024
  ]
  
  for (const pattern of datePatterns) {
    const match = content.match(pattern)
    if (match) return match[0]
  }
  return ''
}

function extractParties(content: string): string[] {
  const parties: string[] = []
  const lines = content.split('\n')
  
  // Look for vs. or versus pattern
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/vs\.|versus/i)) {
      const prevLine = lines[i-1]?.replace(/[#\d\.]/g, '').trim()
      const nextLine = lines[i+1]?.replace(/[#\d\.]/g, '').trim()
      if (prevLine) parties.push(prevLine)
      if (nextLine) parties.push(nextLine)
    }
  }
  
  return parties
}

function extractAdvocates(content: string): string[] {
  const advocates: string[] = []
  const lines = content.split('\n')
  
  // Look for advocate indicators
  const advocatePatterns = [
    /…\s*for the/i,
    /appearing for/i,
    /counsel for/i,
    /advocate for/i
  ]
  
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of advocatePatterns) {
      if (lines[i].match(pattern)) {
        const advocate = lines[i-1]?.replace(/[#\d\.]/g, '').trim()
        if (advocate) advocates.push(advocate)
      }
    }
  }
  
  return advocates
}

function extractSummary(content: string): string {
  const lines = content.split('\n')
  let summary = ''

  // Try to find numbered points first (legal document style)
  const numberedPoints = lines.filter(l => /^\d+\./.test(l))
  if (numberedPoints.length > 0) {
    return numberedPoints.join('\n')
  }

  // If no numbered points, try to extract a meaningful summary
  // Look for paragraphs that might contain key information
  const paragraphs = content.split('\n\n')
  for (const para of paragraphs) {
    // Skip very short paragraphs or those that look like headers
    if (para.length < 50 || para.startsWith('#') || /^[0-9.]+$/.test(para)) continue
    
    // Skip paragraphs that are too long (likely not a summary)
    if (para.length > 500) continue
    
    // Look for paragraphs that might contain summary-like content
    if (
      para.includes('summary') ||
      para.includes('overview') ||
      para.includes('conclusion') ||
      para.includes('therefore') ||
      para.toLowerCase().includes('this document') ||
      para.toLowerCase().includes('the purpose')
    ) {
      summary = para.trim()
      break
    }
  }

  // If still no summary, take the first substantial paragraph
  if (!summary) {
    summary = paragraphs.find(p => 
      p.length > 50 && 
      p.length < 500 && 
      !p.startsWith('#') && 
      !/^[0-9.]+$/.test(p)
    )?.trim() || ''
  }

  return summary
}

export async function extractDocumentInfo(url: string): Promise<ExtractedInfo> {
  try {
    // Upload and start parsing
    const jobId = await uploadAndParse(url)
    console.log('Document upload successful, job ID:', jobId)

    // Poll for completion
    let status
    let attempts = 0
    const maxAttempts = 60 // Maximum 60 attempts (2 minutes)
    const pollInterval = 2000 // Poll every 2 seconds
    
    do {
      status = await checkJobStatus(jobId)
      console.log(`Processing attempt ${attempts + 1}/${maxAttempts}: Status = ${status}`)
      
      if (status === 'ERROR' || status === 'FAILED') {
        throw new Error('Parsing failed - the document could not be processed')
      }
      
      if (status === 'NOT_FOUND') {
        throw new Error('Job not found - the job ID may be invalid or the job may have been deleted')
      }
      
      if (status === 'UNKNOWN') {
        throw new Error('Received unknown status from server')
      }
      
      if (status === 'PROCESSING' || status === 'PENDING') {
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
      
      attempts++
      if (attempts >= maxAttempts) {
        throw new Error(`Document processing timed out after ${maxAttempts * pollInterval / 1000} seconds`)
      }
    } while (status === 'PROCESSING' || status === 'PENDING')

    console.log('Document processing completed successfully')
    
    // Add a small delay after SUCCESS before fetching results
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Get the parsed content
    const parsedContent = await getResults(jobId)
    if (!parsedContent) {
      throw new Error('Received empty content from server')
    }

    console.log('Successfully retrieved content, length:', parsedContent.length)

    // Extract information
    const extractedInfo: ExtractedInfo = {
      title: extractTitle(parsedContent),
      date: extractDate(parsedContent),
      parties: extractParties(parsedContent),
      advocates: extractAdvocates(parsedContent),
      summary: extractSummary(parsedContent),
      content: parsedContent // Include full content for reference
    }

    // Clean up the extracted info by removing empty fields
    Object.keys(extractedInfo).forEach(key => {
      const value = extractedInfo[key as keyof ExtractedInfo]
      if (!value || (Array.isArray(value) && value.length === 0)) {
        delete extractedInfo[key as keyof ExtractedInfo]
      }
    })

    return extractedInfo
  } catch (error) {
    console.error('Error parsing document:', error)
    throw error
  }
} 