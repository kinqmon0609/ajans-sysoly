"use client"

import { useEffect, useState } from "react"
import { DemoCard } from "@/components/demo-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import type { Demo } from "@/lib/demo-context"

export default function DemosPage() {
  const [demos, setDemos] = useState<Demo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Tümü")
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<string[]>(["Tümü"])

  useEffect(() => {
    fetchDemos()
  }, [])

  const fetchDemos = async () => {
    try {
      const response = await fetch("/api/demos")
      if (!response.ok) throw new Error("Failed to fetch demos")
      const data = await response.json()
      setDemos(data.demos || [])
      
      // Kategorileri çıkar
      const uniqueCategories = Array.from(
        new Set(data.demos?.map((demo: Demo) => demo.category) || [])
      ) as string[]
      setCategories(["Tümü", ...uniqueCategories])
    } catch (error) {
      console.error("Demolar yüklenirken hata:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDemos = demos.filter((demo) => {
    const matchesCategory = selectedCategory === "Tümü" || demo.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      demo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demo.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
          Demolarımız
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Sizin için hazırladığımız özel web çözümlerimizi keşfedin. Her biri modern teknolojilerle
          geliştirilmiş, profesyonel ve kullanıcı dostu projeler.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Demo ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Demos Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDemos.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">
            {searchQuery || selectedCategory !== "Tümü"
              ? "Arama kriterlerinize uygun demo bulunamadı."
              : "Henüz demo bulunmamaktadır."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDemos.map((demo) => (
            <DemoCard key={demo.id} demo={demo} />
          ))}
        </div>
      )}

      {/* CTA Section */}
      {filteredDemos.length > 0 && (
        <div className="mt-16 rounded-lg bg-primary/5 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Size Özel Bir Proje Mi İstiyorsunuz?</h2>
          <p className="mb-6 text-muted-foreground">
            İhtiyaçlarınıza özel web çözümleri için bizimle iletişime geçin.
          </p>
          <Button asChild size="lg">
            <a href="/iletisim">Teklif Alın</a>
          </Button>
        </div>
      )}
    </div>
  )
}

