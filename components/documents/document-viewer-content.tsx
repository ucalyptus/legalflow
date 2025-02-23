"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

export function DocumentViewerContent({ document }: DocumentViewerContentProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5))
  const rotate = () => setRotation(prev => (prev + 90) % 360)

  return (
    <div className="flex flex-col h-full">
      {/* Document Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-lg font-semibold">{document.title}</h2>
          {document.caseTitle && (
            <p className="text-sm text-muted-foreground">
              Case: {document.caseTitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={
            document.status === "Approved" ? "success" :
            document.status === "Under Review" ? "warning" : "secondary"
          }>
            {document.status}
          </Badge>
          <Button variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document Toolbar */}
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Page {currentPage}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={rotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto p-4">
        <div 
          className="min-h-full w-full flex items-center justify-center"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s'
          }}
        >
          {document.type.includes('pdf') ? (
            <iframe
              src={`${document.url}#toolbar=0`}
              className="w-full h-full border rounded-lg"
              style={{ minHeight: '800px' }}
            />
          ) : document.type.includes('image') ? (
            <img
              src={document.url}
              alt={document.title}
              className="max-w-full h-auto"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              Preview not available for this file type
            </div>
          )}
        </div>
      </div>

      {/* Document Footer */}
      <div className="border-t p-2 text-sm text-muted-foreground">
        Last modified: {document.lastModified}
      </div>
    </div>
  )
} 