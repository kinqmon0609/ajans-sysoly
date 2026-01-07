"use client"

import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { DemoProvider } from "@/lib/demo-context"
import { PagesProvider } from "@/lib/pages-context"
import { AuthProvider } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import "@/lib/suppress-fetch-errors"

// Metadata "use client" ile kullanılamaz - silindi

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon?a493f8bc56b3d409" type="image/png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <PagesProvider>
            <DemoProvider>
              {isAdminRoute ? (
                // Admin sayfaları - kendi layout'ları var
                children
              ) : (
                // Public sayfalar - Header ve Footer ile
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
              )}
            </DemoProvider>
          </PagesProvider>
        </AuthProvider>
        <AnalyticsTracker />
        <Analytics />
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  )
}
