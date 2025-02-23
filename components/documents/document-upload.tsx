"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UploadDropzone } from "@/lib/uploadthing"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface DocumentUploadProps {
  isOpen: boolean
  onClose: () => void
}

export function DocumentUpload({ isOpen, onClose }: DocumentUploadProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <UploadDropzone
            endpoint="documentUploader"
            onUploadBegin={() => {
              setIsUploading(true)
            }}
            onClientUploadComplete={(res) => {
              setIsUploading(false)
              toast.success("Document uploaded successfully")
              router.refresh()
              onClose()
            }}
            onUploadError={(error: Error) => {
              setIsUploading(false)
              toast.error(`Error uploading document: ${error.message}`)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 