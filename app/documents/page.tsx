"use client"

import React from 'react';
import { Layout } from '@/components/layout';
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Search, Share2, Download, Upload, Tag as TagIcon } from "lucide-react"
import { DocumentFilters } from "@/components/documents/document-filters"
import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentViewer } from "@/components/documents/document-viewer"
import { getDocuments, getDocumentTags, updateDocumentTags } from "@/app/actions/documents"
import TagManager from "@/components/TagManager"
import Tag from "@/components/Tag"
import { DocStatus } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useRouter, useSearchParams } from "next/navigation"

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

interface DocumentTag {
  id: number
  document_id: string
  tags: string[]
  created_at: string
  updated_at: string
}

export default function Documents() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [documentTags, setDocumentTags] = useState<Record<string, string[]>>({})
  const [allTags, setAllTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tagsLoaded, setTagsLoaded] = useState(false)
  const [loadAttempted, setLoadAttempted] = useState(false)

  // Initialize filters from URL
  useEffect(() => {
    // Get tag filters from URL
    const tagParam = searchParams?.get('tags')
    if (tagParam) {
      // First, decode the URL parameter properly
      const decodedTagParam = decodeURIComponent(tagParam)
      console.log('Raw tag param:', tagParam)
      console.log('Decoded tag param:', decodedTagParam)
      
      // Handle both comma-separated and space/plus-separated tags
      // For tags with spaces, we need to handle them as a single tag
      let tags: string[] = []
      
      // Check if the parameter contains encoded spaces or plus signs
      if (decodedTagParam.includes(',')) {
        // Comma-separated tags
        tags = decodedTagParam.split(',').map(t => t.trim())
      } else if (decodedTagParam.includes('+')) {
        // If it's a single tag with spaces (encoded as +)
        if (decodedTagParam.match(/\s*\+\s*/g)?.length === 1) {
          // It's likely a single tag with a space
          tags = [decodedTagParam.replace(/\+/g, ' ')]
        } else {
          // Multiple tags separated by +
          tags = decodedTagParam.split('+').map(t => t.trim())
        }
      } else {
        // Single tag or space-separated
        tags = [decodedTagParam]
      }
      
      // Filter out empty tags
      tags = tags.filter(t => t.length > 0)
      console.log('Parsed tags from URL:', tags)
      setTagFilter(tags)
    }
    
    // Get status filters from URL
    const statusParam = searchParams?.get('status')
    if (statusParam) {
      const statuses = statusParam.split(',')
      setStatusFilter(statuses)
    }
    
    // Get sort from URL
    const sortParam = searchParams?.get('sort')
    if (sortParam) {
      setSortBy(sortParam)
    }
    
    // Get search query from URL
    const searchParam = searchParams?.get('search')
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [searchParams])

  useEffect(() => {
    const loadData = async () => {
      setLoadAttempted(true)
      setIsLoading(true)
      
      try {
        // Load documents first
        const docs = await getDocuments()
        console.log('Fetched documents:', docs.length)
        setDocuments(docs)
        
        // Then load tags
        const tagsData = await getDocumentTags() as DocumentTag[]
        console.log('Fetched document tags:', tagsData.length)
        
        const tagsMap: Record<string, string[]> = {}
        tagsData.forEach(item => {
          tagsMap[item.document_id] = item.tags || []
        })
        
        setDocumentTags(tagsMap)
        setTagsLoaded(true)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!loadAttempted) {
      loadData()
    }
  }, [loadAttempted])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    // Add tag filters to URL - use plus sign format for better compatibility
    if (tagFilter.length > 0) {
      params.set('tags', tagFilter.join('+'))
    }
    
    // Add status filters to URL
    if (statusFilter.length > 0) {
      params.set('status', statusFilter.join(','))
    }
    
    // Add sort to URL
    if (sortBy !== "newest") {
      params.set('sort', sortBy)
    }
    
    // Add search query to URL
    if (searchQuery) {
      params.set('search', searchQuery)
    }
    
    // Update URL without refreshing the page
    const url = params.toString() ? `?${params.toString()}` : ''
    router.push(`/documents${url}`, { scroll: false })
  }, [tagFilter, statusFilter, sortBy, searchQuery, router])

  useEffect(() => {
    let filtered = [...documents]
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.case?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (documentTags[doc.id] || []).some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
    
    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(doc => statusFilter.includes(doc.status))
    }
    
    // Apply tag filter
    if (tagFilter.length > 0) {
      console.log('Applying tag filter:', tagFilter)
      
      const beforeFilterCount = filtered.length
      console.log('Documents before tag filtering:', beforeFilterCount)
      console.log('Document IDs before filtering:', filtered.map(doc => doc.id))
      
      // Log all document tags for debugging
      console.log('All document tags:')
      documents.forEach(doc => {
        console.log(`Document ${doc.id} has tags:`, documentTags[doc.id] || [])
      })
      
      filtered = filtered.filter(doc => {
        const docTags = documentTags[doc.id] || []
        console.log(`Document ${doc.id} has tags:`, docTags)
        
        // Convert all tags to lowercase for case-insensitive comparison
        const lowerDocTags = docTags.map(tag => tag.toLowerCase())
        const lowerTagFilter = tagFilter.map(tag => tag.toLowerCase())
        
        // Check if document has ANY of the filtered tags (OR logic) - case insensitive
        // For tags with spaces, we need to do an exact match
        const hasMatchingTag = lowerTagFilter.some(filterTag => {
          return lowerDocTags.some(docTag => {
            // For multi-word tags, do an exact match
            if (filterTag.includes(' ') || docTag.includes(' ')) {
              return filterTag === docTag;
            }
            // For single-word tags, check if the document tag includes the filter tag
            return docTag === filterTag;
          });
        });
        
        console.log(`Document ${doc.id} matches filter:`, hasMatchingTag)
        
        return hasMatchingTag
      })
      console.log(`Filtered from ${beforeFilterCount} to ${filtered.length} documents`)
      console.log('Document IDs after filtering:', filtered.map(doc => doc.id))
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    }
    
    // Add tags to documents
    filtered = filtered.map(doc => ({
      ...doc,
      tags: documentTags[doc.id] || []
    }))
    
    setFilteredDocuments(filtered)
  }, [documents, searchQuery, statusFilter, tagFilter, sortBy, documentTags])

  // Extract all unique tags from documents
  useEffect(() => {
    const tags = new Set<string>()
    Object.values(documentTags).forEach(docTags => {
      docTags.forEach(tag => tags.add(tag))
    })
    setAllTags(Array.from(tags).sort())
  }, [documentTags])

  const refreshDocuments = async () => {
    try {
      setIsLoading(true)
      const docs = await getDocuments()
      console.log('Fetched documents:', docs.length)
      setDocuments(docs)
      
      // Also refresh tags
      const tagsData = await getDocumentTags() as DocumentTag[]
      console.log('Fetched document tags:', tagsData.length)
      
      const tagsMap: Record<string, string[]> = {}
      tagsData.forEach(item => {
        tagsMap[item.document_id] = item.tags || []
      })
      
      setDocumentTags(tagsMap)
      setTagsLoaded(true)
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTagsChange = async (documentId: string, newTags: string[]) => {
    // Update local state immediately for responsive UI
    setDocumentTags(prev => ({
      ...prev,
      [documentId]: newTags
    }))
    
    try {
      // Update tags in the database using server action
      await updateDocumentTags(documentId, newTags)
    } catch (error) {
      console.error("Failed to update tags:", error)
      // Revert local state if update fails
      refreshDocuments()
    }
  }

  const handleTagClick = (tag: string) => {
    console.log('Tag clicked:', tag)
    
    // If the tag is already in the filter, remove it
    if (tagFilter.includes(tag)) {
      setTagFilter(prev => prev.filter(t => t !== tag))
    } else {
      // Otherwise, add it to the filter
      setTagFilter(prev => [...prev, tag])
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  // Generate a shareable link with current filters
  const getShareableLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const params = new URLSearchParams()
    
    if (tagFilter.length > 0) {
      // For tags with spaces, encode them properly
      // Join with commas instead of plus signs to avoid confusion with spaces
      params.set('tags', tagFilter.join(','))
    }
    
    if (statusFilter.length > 0) {
      params.set('status', statusFilter.join(','))
    }
    
    if (sortBy !== "newest") {
      params.set('sort', sortBy)
    }
    
    if (searchQuery) {
      params.set('search', searchQuery)
    }
    
    return `${baseUrl}/documents${params.toString() ? `?${params.toString()}` : ''}`
  }

  // Copy shareable link to clipboard
  const copyShareableLink = () => {
    const link = getShareableLink()
    navigator.clipboard.writeText(link)
    // You could add a toast notification here
  }

  // Add a debug function
  const debugState = () => {
    console.log('Current state:')
    console.log('Documents:', documents.length)
    console.log('Document IDs:', documents.map(doc => doc.id))
    console.log('Filtered documents:', filteredDocuments.length)
    console.log('Filtered document IDs:', filteredDocuments.map(doc => doc.id))
    console.log('Tag filter:', tagFilter)
    console.log('Status filter:', statusFilter)
    console.log('Document tags:', documentTags)
    console.log('All tags:', allTags)
    console.log('Is loading:', isLoading)
    console.log('Tags loaded:', tagsLoaded)
    
    // Check if documents with the tag filter exist
    if (tagFilter.length > 0) {
      console.log('\nDebug tag filtering:')
      console.log('Current tag filter:', tagFilter)
      
      // Check each document against the tag filter
      documents.forEach(doc => {
        const docTags = documentTags[doc.id] || []
        console.log(`\nDocument ${doc.id} (${doc.title}) has tags:`, docTags)
        
        // Convert all tags to lowercase for case-insensitive comparison
        const lowerDocTags = docTags.map(tag => tag.toLowerCase())
        const lowerTagFilter = tagFilter.map(tag => tag.toLowerCase())
        
        // Check each filter tag against the document tags
        lowerTagFilter.forEach(filterTag => {
          const matchingDocTags = lowerDocTags.filter(docTag => {
            // For multi-word tags, do an exact match
            if (filterTag.includes(' ') || docTag.includes(' ')) {
              const matches = filterTag === docTag
              console.log(`  Comparing "${filterTag}" with "${docTag}" (exact match): ${matches}`)
              return matches
            }
            // For single-word tags, check if they match exactly
            const matches = docTag === filterTag
            console.log(`  Comparing "${filterTag}" with "${docTag}" (exact match): ${matches}`)
            return matches
          })
          
          console.log(`  Document has tag "${filterTag}": ${matchingDocTags.length > 0}`)
        })
        
        // Check if document has ANY of the filtered tags (OR logic)
        const hasMatchingTag = lowerTagFilter.some(filterTag => 
          lowerDocTags.some(docTag => {
            // For multi-word tags, do an exact match
            if (filterTag.includes(' ') || docTag.includes(' ')) {
              return filterTag === docTag
            }
            // For single-word tags, check if they match exactly
            return docTag === filterTag
          })
        )
        
        console.log(`  Document matches filter: ${hasMatchingTag}`)
      })
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Documents</h1>
          <div className="flex gap-2">
            <Button onClick={debugState} variant="outline" className="mr-2">
              Debug
            </Button>
            <Button onClick={copyShareableLink} variant="outline" className="mr-2">
              <Share2 className="w-4 h-4 mr-2" />
              Share View
            </Button>
            <Button onClick={() => setIsUploadOpen(true)} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents or tags..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <DocumentFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
          
          {/* Tag Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                <span>Filter by Tag</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
              {allTags.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-gray-500">No tags available</div>
              ) : (
                allTags.map(tag => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={tagFilter.includes(tag)}
                    onCheckedChange={() => handleTagClick(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Tag Filters */}
        {tagFilter.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tagFilter.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                {tag}
                <button 
                  onClick={() => handleTagClick(tag)} 
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            ))}
            {tagFilter.length > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTagFilter([])}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
        )}

        <div className="grid gap-4 mt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : !tagsLoaded ? (
            <div className="text-center py-8">Loading tags...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {tagFilter.length > 0 ? (
                <>
                  No documents found with the selected tags.
                  <Button 
                    variant="link" 
                    onClick={() => setTagFilter([])}
                    className="ml-2"
                  >
                    Clear tag filters
                  </Button>
                </>
              ) : (
                "No documents found. Upload a document to get started."
              )}
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Card key={doc.id} className="p-4">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" 
                         onClick={() => setSelectedDocument(doc)}>
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">{doc.case?.title || 'No case'}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-sm text-gray-500 capitalize">{doc.status.toLowerCase().replace('_', ' ')}</p>
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
                          onClick={() => handleTagClick(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <TagManager
                      tags={doc.tags || []}
                      onTagsChange={(newTags) => handleTagsChange(doc.id, newTags)}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {isUploadOpen && (
          <DocumentUpload
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onUploadComplete={refreshDocuments}
          />
        )}

        {selectedDocument && (
          <DocumentViewer
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </div>
    </Layout>
  );
} 