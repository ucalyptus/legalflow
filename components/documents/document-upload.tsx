"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UploadButton } from "@uploadthing/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X } from "lucide-react"

interface DocumentUploadProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: () => void
}

interface UploadedFile {
  name: string
  url: string
  size: number
}

export function DocumentUpload({ isOpen, onClose, onUploadComplete }: DocumentUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one document")
      return
    }

    setIsUploading(true)
    try {
      toast.success("Documents uploaded successfully")
      onUploadComplete()
      router.refresh()
      onClose()
      setUploadedFiles([])
    } catch (error) {
      toast.error("Failed to process documents")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
            <UploadButton
              endpoint="documentUploader"
              onUploadBegin={() => {
                setIsUploading(true)
              }}
              onClientUploadComplete={(res) => {
                setIsUploading(false)
                if (res) {
                  setUploadedFiles(prev => [...prev, ...res.map(file => ({
                    name: file.name,
                    url: file.url,
                    size: file.size
                  }))])
                  onUploadComplete()
                }
              }}
              onUploadError={(error: Error) => {
                setIsUploading(false)
                toast.error(`Error uploading document: ${error.message}`)
              }}
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium">Uploaded Files</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUploadedFiles(files => 
                        files.filter((_, i) => i !== index)
                      )}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isUploading || uploadedFiles.length === 0}
            >
              {isUploading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {uploadedFiles.length > 0 ? 'Complete Upload' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 