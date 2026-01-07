"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface PageContent {
  type: "hero" | "features" | "content" | "stats" | "cta" | "columns" | "slider" | "image" | "marquee" | "gallery" | "video" | "container" | "faq" | "features-box" | "service-cards"
  title?: string
  subtitle?: string
  description?: string
  content?: string
  imageUrl?: string
  videoUrl?: string
  buttonText?: string
  buttonUrl?: string
  animationSpeed?: number // Kayan yazı hızı (saniye cinsinden)
  children?: PageContent[] // İç içe widget'lar için
  columns?: Array<{
    id: string
    width?: string
    content?: string
    imageUrl?: string
    title?: string
    description?: string
    children?: PageContent[] // Kolonların içine widget ekleme
  }>
  items?: Array<{
    title?: string
    description?: string
    icon?: string
    value?: string
    label?: string
    imageUrl?: string
    url?: string
    question?: string // FAQ için
    answer?: string // FAQ için
  }>
  style?: {
    backgroundColor?: string
    textColor?: string
    padding?: string
    marginTop?: string
    marginBottom?: string
    borderRadius?: string
    alignment?: string
  }
}

export interface Page {
  id: string
  title: string
  slug: string
  description: string | null
  content: PageContent[]
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface PagesContextType {
  pages: Page[]
  loading: boolean
  refreshPages: () => Promise<void>
  createPage: (page: Partial<Page>) => Promise<void>
  updatePage: (id: string, page: Partial<Page>) => Promise<void>
  deletePage: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
}

const PagesContext = createContext<PagesContextType | undefined>(undefined)

export function PagesProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  const refreshPages = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/pages?includeInactive=true")
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Pages table not found. Please run the database migration script.")
          setPages([])
          return
        }
        console.error(`Failed to fetch pages: ${response.status}`)
        setPages([])
        return
      }
      const data = await response.json()
      const pages = Array.isArray(data) ? data : []
      setPages(pages)
    } catch (error) {
      console.error("Error fetching pages:", error)
      setPages([])
    } finally {
      setLoading(false)
    }
  }

  const createPage = async (page: Partial<Page>) => {
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      })
      if (!response.ok) throw new Error("Failed to create page")
      await refreshPages()
    } catch (error) {
      console.error("Error creating page:", error)
      throw error
    }
  }

  const updatePage = async (id: string, page: Partial<Page>) => {
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      })
      if (!response.ok) throw new Error("Failed to update page")
      await refreshPages()
    } catch (error) {
      console.error("Error updating page:", error)
      throw error
    }
  }

  const deletePage = async (id: string) => {
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete page")
      await refreshPages()
    } catch (error) {
      console.error("Error deleting page:", error)
      throw error
    }
  }

  const toggleStatus = async (id: string) => {
    const page = pages.find((p) => p.id === id)
    if (!page) return

    try {
      await updatePage(id, { is_active: !page.is_active })
    } catch (error) {
      console.error("Error toggling page status:", error)
    }
  }

  useEffect(() => {
    refreshPages()
  }, [])

  return (
    <PagesContext.Provider
      value={{
        pages,
        loading,
        refreshPages,
        createPage,
        updatePage,
        deletePage,
        toggleStatus,
      }}
    >
      {children}
    </PagesContext.Provider>
  )
}

export function usePages() {
  const context = useContext(PagesContext)
  if (context === undefined) {
    throw new Error("usePages must be used within a PagesProvider")
  }
  return context
}
