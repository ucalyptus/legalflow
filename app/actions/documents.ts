"use server"

import { prisma } from "@/lib/prisma"

export async function getDocuments() {
  try {
    console.log('Server: Fetching documents')
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: { case: true }
    })
    console.log('Server: Found', documents.length, 'documents')
    return documents
  } catch (error) {
    console.error('Server: Error fetching documents:', error)
    throw error
  }
}

export async function getCases() {
  return await prisma.case.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { documents: true }
  })
}

// New functions for document tags
export async function getDocumentTags() {
  try {
    console.log('Server: Fetching document tags')
    const result = await prisma.$queryRaw`SELECT * FROM document_tags`;
    console.log('Server: Found', Array.isArray(result) ? result.length : 0, 'document tags')
    return result;
  } catch (error) {
    console.error('Server: Error fetching document tags:', error)
    throw error
  }
}

export async function getDocumentTagsByDocumentId(documentId: string) {
  const result = await prisma.$queryRaw`
    SELECT * FROM document_tags WHERE document_id = ${documentId}
  `;
  return result[0]?.tags || [];
}

export async function updateDocumentTags(documentId: string, tags: string[]) {
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
  
  return { success: true };
} 