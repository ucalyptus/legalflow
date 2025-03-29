import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface DocumentContext {
  id: string
  title: string
  content: string | null
}

interface DocumentChatProps {
  documents: DocumentContext[]
}

export function DocumentChat({ documents }: DocumentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Add initial system message showing available documents
  useState(() => {
    const systemMessage = {
      role: 'assistant' as const,
      content: `I can help you with questions about the following documents:\n${documents.map((doc, i) => `${i + 1}. ${doc.title}`).join('\n')}`
    }
    setMessages([systemMessage])
  }, [documents])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || documents.length === 0) return

    const userMessage = inputValue.trim()
    setInputValue('')
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          contexts: documents.map(doc => ({ content: doc.content }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Chat error:', error)
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Multi-Document Chat</h2>
        <p className="text-sm text-gray-600">
          Ask questions about {documents.length} selected document{documents.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <Card 
              key={index} 
              className={`p-4 ${
                message.role === 'user' 
                  ? 'bg-blue-50 ml-12' 
                  : 'bg-gray-50 mr-12'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="font-medium">
                  {message.role === 'user' ? 'You' : 'Assistant'}:
                </div>
                <div className="flex-1 prose prose-sm max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="my-1">{line}</p>
                  ))}
                </div>
              </div>
            </Card>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask a question about ${documents.length} document${documents.length !== 1 ? 's' : ''}...`}
            className="flex-1 px-3 py-2 border rounded-md"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 