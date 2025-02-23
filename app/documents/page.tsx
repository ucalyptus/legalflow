"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DocumentFilters } from "@/components/documents/document-filters"
import { DocumentViewer } from "@/components/documents/document-viewer"
import { 
  Download, 
  FileText, 
  Search, 
  Share2, 
  Upload 
} from "lucide-react"
import { DocumentUpload } from "@/components/documents/document-upload"
import { getDocuments } from "@/app/actions/documents"

interface DocumentItem {
  id: string
  title: string
  caseTitle: string
  status: "Draft" | "Submitted" | "Under Review" | "Approved"
  type: string
  lastModified: string
  url: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  useEffect(() => {
    async function loadDocuments() {
      const docs = await getDocuments()
      setDocuments(docs)
    }
    loadDocuments()
  }, [])

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.caseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || doc.status.toLowerCase().replace(" ", "-") === statusFilter
      const matchesType = typeFilter === "all" || doc.type.toLowerCase() === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        case "oldest":
          return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
        case "name-asc":
          return a.title.localeCompare(b.title)
        case "name-desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-lg font-semibold">Documents</h1>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="w-[200px] pl-8 md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <DocumentFilters
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
          onSortChange={setSortBy}
        />

        <div className="grid gap-4">
          {filteredDocuments.map((doc) => (
            <Card 
              key={doc.id} 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedDocument({
                id: doc.id,
                title: doc.title,
                url: doc.url,
                type: doc.type,
                status: doc.status,
                caseTitle: doc.caseTitle,
                lastModified: doc.lastModified
              })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Case: {doc.caseTitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    doc.status === "Approved" 
                      ? "bg-green-100 text-green-800"
                      : doc.status === "Under Review"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {doc.status}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <span className="mr-4">Type: {doc.type}</span>
                <span>Last modified: {doc.lastModified}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <DocumentViewer
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />

      <DocumentUpload 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  )
} 