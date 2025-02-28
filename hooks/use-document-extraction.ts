import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ExtractionState {
  isExtracting: boolean
  documentId: string
  jobId: string
  startTime: number
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
  const { mutate: startExtraction, isLoading } = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: documentUrl })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to extract document')
      }
      
      return response.json()
    },
    onMutate: () => {
      const state: ExtractionState = {
        isExtracting: true,
        documentId,
        jobId: '',
        startTime: Date.now()
      }
      localStorage.setItem(`extraction-${documentId}`, JSON.stringify(state))
      toast.info('Started extracting information from document')
    },
    onSuccess: (data) => {
      // Clear extraction state since we got the results
      localStorage.removeItem(`extraction-${documentId}`)
      
      if (data.status === 'error') {
        toast.error(data.error || 'Failed to extract document')
      } else if (data.status === 'completed') {
        toast.success('Document extraction completed')
      }
    },
    onError: (error) => {
      localStorage.removeItem(`extraction-${documentId}`)
      toast.error(error instanceof Error ? error.message : 'Failed to extract document')
    }
  })

  const isExtracting = isLoading
  const jobId = getStoredState()?.jobId || ''

  return {
    isExtracting,
    startExtraction,
    extractionData: null, // We'll handle the data directly from mutation
    jobId
  }
} 