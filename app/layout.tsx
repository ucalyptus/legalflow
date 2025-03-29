import type { Metadata } from 'next'
import "@/app/globals.css"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"
import { ourFileRouter } from "@/app/api/uploadthing/core"
import { Toaster } from "sonner"
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'LegalFlow',
  description: 'LegalFlow is a platform for legal professionals',
  generator: 'LegalFlow',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
