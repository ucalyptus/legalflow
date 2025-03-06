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
  X,
  MessageSquare,
  FileText,
  Scan,
  Sparkles
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useDocumentExtraction } from '@/hooks/use-document-extraction'
import { Card } from "@/components/ui/card"
import { DocumentChat } from "@/components/chat/document-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  results?: {
    content: string | null
  }
}

export function DocumentViewerContent({ document }: DocumentViewerContentProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [extractionResults, setExtractionResults] = useState<{
    mistral: ExtractionData | null,
    llamaparse: ExtractionData | null
  }>({
    mistral: null,
    llamaparse: null
  })
  const [activeTab, setActiveTab] = useState<'extract' | 'chat'>('extract')
  const [loadingProvider, setLoadingProvider] = useState<'llamaparse' | 'mistral' | null>(null)

  const {
    isExtracting: useDocumentExtractionIsExtracting,
    startExtraction
  } = useDocumentExtraction(document.id, document.url)

  const handleExtract = async (method: 'llamaparse' | 'mistral') => {
    if (loadingProvider) return // Prevent multiple extractions while loading
    
    try {
      setLoadingProvider(method)
      const response = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: document.url,
          method 
        })
      })

      const data = await response.json()
      console.log(`${method} response:`, data) // Debug log
      
      // Ensure we're setting the content correctly
      setExtractionResults(prev => ({
        ...prev,
        [method]: {
          status: 'completed',
          results: {
            content: data.results?.content || null
          }
        }
      }))
    } catch (error) {
      console.error(`${method} extraction error:`, error)
      setExtractionResults(prev => ({
        ...prev,
        [method]: { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Failed to extract document'
        }
      }))
    } finally {
      setLoadingProvider(null)
    }
  }

  const renderProviderResults = (provider: 'llamaparse' | 'mistral') => {
    const results = extractionResults[provider]
    
    if (!results) {
      return null
    }

    if (results.status === 'error') {
      return (
        <Card key={provider} className="p-4 bg-red-50 text-red-700">
          <h3 className="font-semibold capitalize mb-2">{provider}</h3>
          <p>Error: {results.error}</p>
        </Card>
      )
    }

    if (results.status === 'completed' && results.results?.content) {
      return (
        <Card key={provider} className="p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold capitalize">{provider}</h3>
          </div>
          <div className="prose prose-sm max-w-none overflow-auto max-h-[calc(100vh-15rem)]">
            {results.results.content.split('\n').map((line, i) => (
              <p key={i} className="whitespace-pre-wrap break-words">{line || '\u00A0'}</p>
            ))}
          </div>
        </Card>
      )
    }

    return null
  }

  const renderExtractionResults = () => {
    if (!extractionResults.mistral && !extractionResults.llamaparse) {
      return (
        <div className="text-gray-500 text-center p-4">
          Click either the document or scan icon to extract information from this document
        </div>
      )
    }

    return (
      <div className="space-y-4 h-full">
        {loadingProvider && (
          <Card className="p-4 bg-blue-50 text-blue-700">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p>Processing document with {loadingProvider}...</p>
            </div>
          </Card>
        )}
        <div className="grid grid-cols-1 gap-4 h-full">
          {renderProviderResults('llamaparse')}
          {renderProviderResults('mistral')}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full max-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-1 relative flex flex-col">
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{document.type}</Badge>
            <Badge variant="outline">{document.status}</Badge>
          </div>
          <div className="flex items-center gap-4">
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
            </div>
            <div className="flex items-center space-x-2">
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
            </div>
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
        <Tabs defaultValue="extract" className="flex-1 flex flex-col h-full">
          <div className="border-b">
            <TabsList className="w-full">
              <TabsTrigger value="extract" className="flex-1">
                <Brain className="h-4 w-4 mr-2" />
                Extract
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="extract" className="flex-1 flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Document Information</h2>
              <div className="flex items-center gap-3 mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExtract('llamaparse')}
                  disabled={loadingProvider !== null}
                  className={`flex-1 h-9 px-3 ${extractionResults['llamaparse']?.status === 'completed' ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' : ''}`}
                >
                  {loadingProvider === 'llamaparse' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="truncate">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">LlamaParse</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtract('mistral')}
                  disabled={loadingProvider !== null}
                  className={`flex-1 h-9 px-3 ${extractionResults['mistral']?.status === 'completed' ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' : ''}`}
                >
                  {loadingProvider === 'mistral' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="truncate">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Mistral</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 h-[calc(100vh-10rem)]">
              <div className="p-4 space-y-4">
                {loadingProvider && (
                  <Card className="p-4 bg-blue-50 text-blue-700">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <p>Processing document with {loadingProvider}...</p>
                    </div>
                  </Card>
                )}
                
                {!extractionResults.mistral && !extractionResults.llamaparse && !loadingProvider && (
                  <div className="text-gray-500 text-center p-8">
                    Select either LlamaParse or Mistral above to extract information from this document
                  </div>
                )}

                {extractionResults.llamaparse?.status === 'completed' && (
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold capitalize">LlamaParse Results</h3>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {extractionResults.llamaparse.results?.content ? 
                        extractionResults.llamaparse.results.content.split('\n').map((line, i) => (
                          <p key={i} className="whitespace-pre-wrap break-words my-1">{line || '\u00A0'}</p>
                        )) : 
                        <p className="text-gray-500">No content extracted</p>
                      }
                    </div>
                  </Card>
                )}
                
                {extractionResults.mistral?.status === 'completed' && (
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold capitalize">Mistral Results</h3>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {extractionResults.mistral.results?.content ? 
                        extractionResults.mistral.results.content.split('\n').map((line, i) => (
                          <p key={i} className="whitespace-pre-wrap break-words my-1">{line || '\u00A0'}</p>
                        )) : 
                        <p className="text-gray-500">No content extracted</p>
                      }
                    </div>
                  </Card>
                )}
                
                {extractionResults.llamaparse?.status === 'error' && (
                  <Card className="p-4 bg-red-50 text-red-700">
                    <h3 className="font-semibold capitalize mb-2">LlamaParse Error</h3>
                    <p>{extractionResults.llamaparse.error}</p>
                  </Card>
                )}
                
                {extractionResults.mistral?.status === 'error' && (
                  <Card className="p-4 bg-red-50 text-red-700">
                    <h3 className="font-semibold capitalize mb-2">Mistral Error</h3>
                    <p>{extractionResults.mistral.error}</p>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
            {extractionResults.mistral?.status === 'completed' || extractionResults.llamaparse?.status === 'completed' ? (
              <DocumentChat documentContext={extractionResults.mistral?.results || extractionResults.llamaparse?.results} />
            ) : (
              <div className="p-8 text-center text-gray-500">
                Please extract document information first using either LlamaParse or Mistral
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 