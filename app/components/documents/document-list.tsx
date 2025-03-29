import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Share2, Download } from "lucide-react"
import { DocStatus } from "@prisma/client"
import TagManager from "@/components/TagManager"

interface Document {
  id: string
  title: string
  url: string
  type: string
  size: number
  status: DocStatus
  caseId?: string | null
  case?: {
    id: string
    title: string
  } | null
  createdAt: Date
  updatedAt: Date
  userId: string
  tags?: string[]
}

interface DocumentListProps {
  documents: Document[]
  documentTags: Record<string, string[]>
  onDocumentSelect: (document: Document) => void
  isLoading: boolean
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}

export function DocumentList({ documents, documentTags, onDocumentSelect, isLoading }: DocumentListProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading documents...</div>
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No documents found.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="p-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer" 
                onClick={() => onDocumentSelect(doc)}
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="font-medium">{doc.title}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">{doc.case?.title || 'No case'}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-sm text-gray-500 capitalize">
                      {doc.status.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Tags section */}
            <div className="mt-3 ml-8">
              <div className="flex flex-wrap gap-2 mb-2">
                {(doc.tags || []).map(tag => (
                  <Badge 
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <TagManager
                tags={doc.tags || []}
                onTagsChange={(newTags) => {
                  // This will be handled by the parent component
                  console.log('Tags updated:', newTags)
                }}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 