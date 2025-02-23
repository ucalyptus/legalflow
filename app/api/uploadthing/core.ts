import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getAuth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
 
const f = createUploadthing()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)
 
export const ourFileRouter = {
  documentUploader: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(async ({ req }) => {
      const { userId } = getAuth(req)
      if (!userId) throw new Error("Unauthorized")
      return { userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Save file metadata to Supabase
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            user_id: metadata.userId,
            title: file.name,
            url: file.url,
            type: file.type,
            size: file.size,
            status: "Draft"
          }
        ])
        .select()

      if (error) throw error
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter 