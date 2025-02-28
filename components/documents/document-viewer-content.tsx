"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Brain,
  Loader2,
  X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useDocumentExtraction } from '@/hooks/use-document-extraction'
import { Card } from "@/components/ui/card"

interface DocumentViewerContentProps {
  document: {
    id: string
    title: string
    url: string
    type: string
    status: string
    caseTitle?: string
    lastModified: string
  }
}

interface ExtractionResults {
  caseNumber: string
  date: string
  parties: string[]
  advocates: string[]
  summary: string
}

interface ExtractionData {
  status: 'error' | 'processing' | 'completed'
  error?: string
  results?: ExtractionResults
}

export function DocumentViewerContent({ document }: DocumentViewerContentProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [extractionResults, setExtractionResults] = useState<any>(null)

  const {
    isExtracting,
    startExtraction
  } = useDocumentExtraction(document.id, document.url)

  const handleExtract = async () => {
    try {
      const response = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: document.url })
      })

      const data = await response.json()
      setExtractionResults(data)
    } catch (error) {
      console.error('Extraction error:', error)
      setExtractionResults({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to extract document' 
      })
    }
  }

  const renderExtractionResults = () => {
    if (!extractionResults) {
      return (
        <div className="text-gray-500 text-center p-4">
          Click the brain icon to extract information from this document
        </div>
      )
    }

    if (extractionResults.status === 'error') {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <p>Error: {extractionResults.error}</p>
        </div>
      )
    }

    if (isExtracting) {
      return (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Processing document...</p>
          </div>
        </div>
      )
    }

    if (extractionResults.status === 'completed' && extractionResults.results) {
      const results = extractionResults.results
      return (
        <div className="space-y-4">
          {Object.entries(results).map(([key, value]) => {
            // Skip empty values
            if (!value || (Array.isArray(value) && value.length === 0)) return null
            
            return (
              <Card key={key} className="p-4">
                <h3 className="font-semibold capitalize mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                {Array.isArray(value) ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {value.map((item, index) => (
                      <li key={index} className="break-words">{String(item)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{String(value)}</p>
                )}
              </Card>
            ) as React.ReactNode
          })}
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex h-full max-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-1 relative flex flex-col">
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{document.type}</Badge>
            <Badge variant="outline">{document.status}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setScale(s => Math.min(2, s + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setRotation(r => (r + 90) % 360)}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={document.url} download={document.title}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
              navigator.clipboard.writeText(document.url)
              toast.success("Link copied to clipboard")
            }}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleExtract}
              disabled={isExtracting}
            >
              {isExtracting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 mt-16 overflow-hidden">
          <iframe 
            src={document.url} 
            className="w-full h-full"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          />
        </div>
      </div>

      <div className="w-96 border-l flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Document Information</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {renderExtractionResults()}
        </div>
      </div>
    </div>
  )
} 