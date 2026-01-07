"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Demo = {
  id: string
  title: string
  description: string
  category: string
  price: number
  images: string[]
  features: string[]
  technologies: string[]
  demo_url: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
  thumbnail?: string
  shortDescription?: string
}

type DemoContextType = {
  demos: Demo[]
  loading: boolean
  addDemo: (demo: Omit<Demo, "id" | "created_at" | "updated_at">) => Promise<void>
  updateDemo: (id: string, demo: Partial<Demo>) => Promise<void>
  deleteDemo: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
  refreshDemos: () => Promise<void>
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demos, setDemos] = useState<Demo[]>([])
  const [loading, setLoading] = useState(true)

  const refreshDemos = async () => {
    try {
      setLoading(true)
      // Admin panelinde TÜM demoları çek (aktif + pasif)
      const response = await fetch("/api/demos?includeInactive=true")
      const data = await response.json()
      
      // Demolar artık API'den minimal data geliyor (images, features, technologies boş)
      setDemos(data.demos || [])
    } catch (error) {
      console.error("Error fetching demos:", error)
      setDemos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshDemos()
  }, [])

  const addDemo = async (demo: Omit<Demo, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch("/api/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demo),
      })
      const data = await response.json()
      if (data.demo) {
        setDemos((prev) => [data.demo, ...prev])
      }
    } catch (error) {
      console.error("Error adding demo:", error)
      throw error
    }
  }

  const updateDemo = async (id: string, updatedDemo: Partial<Demo>) => {
    try {
      const response = await fetch(`/api/demos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDemo),
      })
      const data = await response.json()
      if (data.demo) {
        setDemos((prev) => prev.map((demo) => (demo.id === id ? data.demo : demo)))
      }
    } catch (error) {
      console.error("Error updating demo:", error)
      throw error
    }
  }

  const deleteDemo = async (id: string) => {
    try {
      await fetch(`/api/demos/${id}`, {
        method: "DELETE",
      })
      setDemos((prev) => prev.filter((demo) => demo.id !== id))
    } catch (error) {
      console.error("Error deleting demo:", error)
      throw error
    }
  }

  const toggleStatus = async (id: string) => {
    const demo = demos.find((d) => d.id === id)
    if (!demo) return

    await updateDemo(id, { is_active: !demo.is_active })
  }

  return (
    <DemoContext.Provider value={{ demos, loading, addDemo, updateDemo, deleteDemo, toggleStatus, refreshDemos }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemos() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error("useDemos must be used within a DemoProvider")
  }
  return context
}
