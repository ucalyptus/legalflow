"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

export default function APITest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [formData, setFormData] = useState({
    agreement: '',
    companyName: '',
    contactPerson: '',
    instructions: '',
    templateText: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            agreement: formData.agreement,
            companyName: formData.companyName,
            contactPerson: formData.contactPerson,
            instructions: formData.instructions,
          },
          templateText: formData.templateText
        })
      })

      const data = await response.json()
      setResult(data.content)
    } catch (error) {
      console.error('Error:', error)
      setResult('Error generating document')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">API Test Interface</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Agreement Type</label>
              <Input
                name="agreement"
                value={formData.agreement}
                onChange={handleChange}
                placeholder="e.g. Shareholders Agreement"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <Input
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Example Corp"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Person</label>
              <Input
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instructions</label>
              <Textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Enter any specific instructions..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Template Text (Optional)</label>
              <Textarea
                name="templateText"
                value={formData.templateText}
                onChange={handleChange}
                placeholder="Enter template text..."
                rows={5}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Document'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generated Document</h2>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: result || 'Generated content will appear here...' }}
          />
        </Card>
      </div>
    </div>
  )
} 