import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
 
const f = createUploadthing()

const auth = (req: Request) => ({ id: "fakeId" }) // Fake auth function

export const ourFileRouter = {
  documentUploader: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(async ({ req }) => {
      const user = auth(req)
      if (!user) throw new Error("Unauthorized")
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Save file metadata to Railway PostgreSQL via Prisma
      const document = await prisma.document.create({
        data: {
          title: file.name,
          url: file.url,
          type: file.type,
          size: file.size,
          status: "DRAFT",
          userId: metadata.userId
        }
      })

      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter 