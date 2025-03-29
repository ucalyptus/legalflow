import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MultiDocumentViewer } from './multi-document-viewer'
import { Document } from '@/app/types/document'

export function DocumentViewerContent({ documents }: { documents: Document[] }) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="extract" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="extract">Extract & Chat</TabsTrigger>
            <TabsTrigger value="view">View Documents</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="extract" className="flex-1">
          <MultiDocumentViewer documents={documents} />
        </TabsContent>

        <TabsContent value="view" className="flex-1">
          <div className="p-4 space-y-4">
            {documents.map(doc => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{doc.title}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    View Original
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 