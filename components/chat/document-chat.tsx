"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface DocumentChatProps {
  documentContext: any
}

export function DocumentChat({ documentContext }: DocumentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          documentContext
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages(prev => [...prev, data.message])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Document Q&A</h2>
        <p className="text-sm text-gray-500">Ask questions about the document</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((message, index) => (
            <Card
              key={index}
              className={`p-3 ${
                message.role === 'user'
                  ? 'bg-blue-50 ml-8'
                  : 'bg-gray-50 mr-8'
              }`}
            >
              <p className="text-sm font-medium mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </p>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </Card>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
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