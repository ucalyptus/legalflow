"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, Share2, X } from "lucide-react"
import type { DocumentItem } from "@/types/documents"

interface DocumentViewerProps {
  document: DocumentItem | null
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  if (!document) return null

  return (
    <Dialog open={!!document} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{document.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Case: {document.caseTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  Type: {document.type}
                </p>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${
                document.status === "Approved" 
                  ? "bg-green-100 text-green-800"
                  : document.status === "Under Review"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {document.status}
              </div>
            </div>
            <div className="mt-4">
              {/* Placeholder for document content */}
              <p className="text-sm text-muted-foreground">
                Document content would be displayed here...
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 