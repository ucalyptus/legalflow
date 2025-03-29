"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DocumentViewerContent } from "./document-viewer-content"

interface Document {
  id: string
  title: string
  url: string
  type: string
  status: string
  caseTitle?: string
  lastModified: string
}

interface DocumentViewerProps {
  documents: Document[]
  onClose: () => void
}

export function DocumentViewer({ documents, onClose }: DocumentViewerProps) {
  if (!documents || documents.length === 0) return null

  return (
    <Dialog open={documents.length > 0} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh]">
        <DocumentViewerContent documents={documents} />
      </DialogContent>
    </Dialog>
  )
} 