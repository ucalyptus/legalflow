"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Download, 
  FileText, 
  Search, 
  Share2, 
  Upload 
} from "lucide-react"

interface DocumentItem {
  id: string
  title: string
  caseTitle: string
  status: "Draft" | "Submitted" | "Under Review" | "Approved"
  type: string
  lastModified: string
}

const documents: DocumentItem[] = [
  {
    id: "1",
    title: "Contract Agreement - ABC Corp",
    caseTitle: "ABC Corp vs XYZ Ltd",
    status: "Under Review",
    type: "Contract",
    lastModified: "2024-02-23"
  },
  {
    id: "2",
    title: "Pleading Document - Case 123",
    caseTitle: "State vs John Doe",
    status: "Approved",
    type: "Pleading",
    lastModified: "2024-02-22"
  },
  // Add more sample documents as needed
]

export default function DocumentsPage() {
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
              />
            </div>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
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
    </div>
  )
} 