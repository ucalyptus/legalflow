"use server"

import { prisma } from "@/lib/prisma"

export async function getDocuments() {
  return await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: { case: true }
  })
}

export async function getCases() {
  return await prisma.case.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { documents: true }
  })
} 