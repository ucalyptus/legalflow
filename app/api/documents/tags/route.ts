import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT * FROM document_tags`;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching document tags:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { documentId, tags } = body;

    // Check if document already has tags
    const existingTags = await prisma.$queryRaw`
      SELECT * FROM document_tags WHERE document_id = ${documentId}
    `;
    
    if (existingTags.length > 0) {
      // Update existing tags
      await prisma.$executeRaw`
        UPDATE document_tags 
        SET tags = ${tags}::text[], updated_at = NOW() 
        WHERE document_id = ${documentId}
      `;
    } else {
      // Insert new tags
      await prisma.$executeRaw`
        INSERT INTO document_tags (document_id, tags) 
        VALUES (${documentId}, ${tags}::text[])
      `;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating document tags:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 