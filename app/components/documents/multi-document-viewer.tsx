import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DocumentChat } from '@/app/components/DocumentChat'
import { Document } from '@/app/types/document'

interface MultiDocumentViewerProps {
  documents: Document[]
}

export function MultiDocumentViewer({ documents }: MultiDocumentViewerProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([])

  const toggleDocument = (document: Document) => {
    if (selectedDocuments.find(d => d.id === document.id)) {
      setSelectedDocuments(selectedDocuments.filter(d => d.id !== document.id))
    } else {
      setSelectedDocuments([...selectedDocuments, document])
    }
  }

  return (
    <div className="flex h-full">
      {/* Document List */}
      <div className="w-1/3 border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Available Documents</h2>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {documents.map(doc => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{doc.title}</h3>
                  <div className="space-x-2">
                    <Button
                      variant={selectedDocuments.find(d => d.id === doc.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDocument(doc)}
                    >
                      {selectedDocuments.find(d => d.id === doc.id) ? "Selected" : "Select"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        {selectedDocuments.length > 0 ? (
          <DocumentChat documents={selectedDocuments} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select documents to start chatting
          </div>
        )}
      </div>
    </div>
  )
} 