import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { messages, documentContext } = await request.json()

    if (!messages || !documentContext) {
      return NextResponse.json(
        { error: 'Messages and document context are required' },
        { status: 400 }
      )
    }

    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant analyzing a legal document. Use the following extracted information from the document to answer questions: \n\n${JSON.stringify(documentContext, null, 2)}\n\nProvide accurate answers based on this context. If you cannot find relevant information in the provided context, say so.`
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500
    })

    return NextResponse.json({
      message: response.choices[0].message
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
} 