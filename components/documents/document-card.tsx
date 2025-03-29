import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DocStatus } from "@prisma/client"
import { cn } from "@/lib/utils"
import { FileText, Share2, Download } from "lucide-react"

interface Document {
  id: string
  title: string
  status: DocStatus
  createdAt: string
  updatedAt: string
}

interface DocumentCardProps {
  document: Document
  tags: string[]
  onTagUpdate?: (documentId: string, tags: string[]) => void
  onTagClick?: (tag: string) => void
  selected?: boolean
  onSelect?: () => void
}

export function DocumentCard({
  document,
  tags,
  onTagUpdate,
  onTagClick,
  selected = false,
  onSelect,
}: DocumentCardProps) {
  return (
    <Card 
      className={cn(
        "relative cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">{document.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={document.status === "DRAFT" ? "secondary" : "default"}>
              {document.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Updated {new Date(document.updatedAt).toLocaleDateString()}
            </span>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTagClick?.(tag)
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 