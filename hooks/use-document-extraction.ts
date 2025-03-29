import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Query } from '@tanstack/react-query'

interface ExtractionState {
  isExtracting: boolean
  documentId: string
  jobId: string
  startTime: number
}

interface ExtractionStatus {
  status: 'pending' | 'completed' | 'error'
  result?: any
  error?: string
}

export function useDocumentExtraction(documentId: string, documentUrl: string) {
  // Check local storage for existing extraction state
  const getStoredState = (): ExtractionState | null => {
    const stored = localStorage.getItem(`extraction-${documentId}`)
    if (stored) {
      const state = JSON.parse(stored)
      // Clear if it's been more than 5 minutes
      if (Date.now() - state.startTime > 5 * 60 * 1000) {
        localStorage.removeItem(`extraction-${documentId}`)
        return null
      }
      return state
    }
    return null
  }

  // Mutation to start extraction
  const { mutate: startExtraction, isPending: isStarting } = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/parse-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentId, url: documentUrl })
      })

      if (!response.ok) {
        throw new Error('Failed to start extraction')
      }

      const data = await response.json()
      
      // Save extraction state to local storage
      const state: ExtractionState = {
        isExtracting: true,
        documentId,
        jobId: data.jobId,
        startTime: Date.now()
      }
      localStorage.setItem(`extraction-${documentId}`, JSON.stringify(state))
      
      return data
    },
    onError: (error) => {
      console.error('Failed to start extraction:', error)
      toast.error('Failed to start document extraction')
      localStorage.removeItem(`extraction-${documentId}`)
    }
  })

  // Query to poll extraction status
  const { data: extractionStatus, isPending: isPolling } = useQuery<ExtractionStatus | null>({
    queryKey: ['extraction-status', documentId],
    queryFn: async () => {
      const state = getStoredState()
      if (!state?.jobId) return null

      const response = await fetch(`/api/parse-document/status?jobId=${state.jobId}`)
      if (!response.ok) {
        throw new Error('Failed to get extraction status')
      }

      const data: ExtractionStatus = await response.json()
      
      if (data.status === 'completed') {
        // Clear extraction state on completion
        localStorage.removeItem(`extraction-${documentId}`)
        toast.success('Document extraction completed')
      } else if (data.status === 'error') {
        // Clear extraction state on error
        localStorage.removeItem(`extraction-${documentId}`)
        toast.error(data.error || 'Failed to extract document')
      }
      
      return data
    },
    enabled: !!getStoredState()?.jobId, // Only run query if we have a jobId
    refetchInterval: (query) => {
      const data = query.state.data
      return data && data.status === 'pending' ? 2000 : false
    },
    retry: 3
  })

  const isExtracting = isStarting || isPolling
  const jobId = getStoredState()?.jobId || ''

  return {
    isExtracting,
    startExtraction,
    extractionData: extractionStatus?.result,
    jobId
  }
} 