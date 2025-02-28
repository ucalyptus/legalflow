import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasLlamaKey: !!process.env.LLAMA_CLOUD_API_KEY,
    keyFirstChars: process.env.LLAMA_CLOUD_API_KEY?.substring(0, 6)
  })
} 