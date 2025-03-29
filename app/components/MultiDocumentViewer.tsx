import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Sparkles } from 'lucide-react'
import { DocumentChat } from './DocumentChat'

interface Document {
  id: string
  title: string
  url: string
}

interface ExtractedDocument {
  id: string
  title: string
  content: string | null
  status: 'idle' | 'extracting' | 'completed' | 'error'
  error?: string
}

interface MultiDocumentViewerProps {
  documents: Document[]
}

export function MultiDocumentViewer({ documents }: MultiDocumentViewerProps) {
  const [activeTab, setActiveTab] = useState<'extract' | 'chat'>('extract')
  const [extractedDocs, setExtractedDocs] = useState<ExtractedDocument[]>(
    documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: null,
      status: 'idle'
    }))
  )

  const handleExtract = async (docId: string, method: 'llamaparse' | 'mistral') => {
    // Update document status to extracting
    setExtractedDocs(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: 'extracting' as const } : doc
    ))
    
    try {
      const doc = documents.find(d => d.id === docId)
      if (!doc) throw new Error('Document not found')

      const response = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: doc.url,
          method 
        })
      })

      if (!response.ok) throw new Error('Failed to extract document')
      
      const data = await response.json()
      
      setExtractedDocs(prev => prev.map(doc => 
        doc.id === docId ? {
          ...doc,
          content: data.results?.content || null,
          status: 'completed' as const
        } : doc
      ))
    } catch (error) {
      console.error(`Extraction error for document ${docId}:`, error)
      setExtractedDocs(prev => prev.map(doc => 
        doc.id === docId ? {
          ...doc,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Failed to extract document'
        } : doc
      ))
    }
  }

  const completedDocs = extractedDocs.filter(doc => doc.status === 'completed')
  const canChat = completedDocs.length > 0

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab as any} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="extract">Extract</TabsTrigger>
            <TabsTrigger value="chat" disabled={!canChat}>
              Chat ({completedDocs.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="extract" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {extractedDocs.map(doc => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{doc.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtract(doc.id, 'llamaparse')}
                        disabled={doc.status === 'extracting'}
                      >
                        {doc.status === 'extracting' ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        LlamaParse
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtract(doc.id, 'mistral')}
                        disabled={doc.status === 'extracting'}
                      >
                        {doc.status === 'extracting' ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Mistral
                      </Button>
                    </div>
                  </div>

                  {doc.status === 'completed' && (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-green-600 mb-2">✓ Extraction complete</p>
                      {doc.content && (
                        <div className="max-h-40 overflow-y-auto border rounded p-2">
                          {doc.content.split('\n').map((line, i) => (
                            <p key={i} className="my-1">{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {doc.status === 'error' && (
                    <div className="text-red-600">
                      Error: {doc.error}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="chat" className="flex-1">
          {canChat ? (
            <DocumentChat documents={completedDocs} />
          ) : (
            <div className="p-8 text-center text-gray-500">
              Extract at least one document first to start chatting
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 