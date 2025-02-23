"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DocumentViewerContent } from "./document-viewer-content"

interface DocumentViewerProps {
  document: {
    id: string
    title: string
    url: string
    type: string
    status: string
    caseTitle?: string
    lastModified: string
  } | null
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  if (!document) return null

  return (
    <Dialog open={!!document} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh]">
        <DocumentViewerContent document={document} />
      </DialogContent>
    </Dialog>
  )
} 