"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDemos, type Demo } from "@/lib/demo-context"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import Image from "next/image"

type DemoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  demo: Demo | null
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

export function DemoFormDialog({ open, onOpenChange, demo }: DemoFormDialogProps) {
  const { addDemo, updateDemo } = useDemos()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    description: "",
    features: "",
    technologies: "",
    demo_url: "",
  })

  const [imagesPreviews, setImagesPreviews] = useState<string[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) throw new Error("Failed to fetch categories")
        const data = await response.json()
        setCategories(data)
        // Set default category if not editing
        if (!demo && data.length > 0) {
          setFormData((prev) => ({ ...prev, category: data[0].name }))
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Hata",
          description: "Kategoriler yüklenemedi",
          variant: "destructive",
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const fetchDemoDetails = async (id: string) => {
    try {
      console.log('🔍 Demo detayları çekiliyor:', id)
      const res = await fetch(`/api/demos/${id}`)
      const data = await res.json()
      const detailedDemo = data.demo || data // API { demo: {...} } veya direkt {...} dönebilir
      
      console.log('📦 Gelen demo:', {
        title: detailedDemo.title,
        category: detailedDemo.category,
        price: detailedDemo.price,
        features: detailedDemo.features,
        technologies: detailedDemo.technologies,
        images: detailedDemo.images
      })
      
      setFormData({
        title: detailedDemo.title || "",
        category: detailedDemo.category || "",
        price: detailedDemo.price?.toString() || "",
        description: detailedDemo.description || "",
        features: (detailedDemo.features || []).join(", "),
        technologies: (detailedDemo.technologies || []).join(", "),
        demo_url: detailedDemo.demo_url || "",
      })
      setImagesPreviews(detailedDemo.images || [])
      
      console.log('✅ Form dolduruldu')
    } catch (error) {
      console.error("❌ Demo detayları yüklenemedi:", error)
    }
  }

  useEffect(() => {
    // Dialog açıldığında çalış
    if (open) {
      if (demo) {
        // Demo edit için tam detayı tekrar çekelim
        fetchDemoDetails(demo.id)
      } else {
        // Yeni demo için boş form
        setFormData({
          title: "",
          category: categories.length > 0 ? categories[0].name : "",
          price: "",
          description: "",
          features: "",
          technologies: "",
          demo_url: "",
        })
        setImagesPreviews([])
      }
    }
  }, [demo, open]) // categories'i kaldırdık, sadece open ve demo'ya bağlı

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    toast({
      title: "Yükleniyor...",
      description: `${files.length} resim yükleniyor`,
    })

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Upload failed')
        }
        
        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImagesPreviews([...imagesPreviews, ...uploadedUrls])

      toast({
        title: "Başarılı",
        description: "Resimler yüklendi",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Hata",
        description: "Resimler yüklenirken hata oluştu",
        variant: "destructive",
      })
    }
  }

  const removeImage = (index: number) => {
    const newPreviews = imagesPreviews.filter((_, i) => i !== index)
    setImagesPreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const demoData = {
        title: formData.title,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        description: formData.description,
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        technologies: formData.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        images: imagesPreviews.length > 0 ? imagesPreviews : ["/placeholder.svg"],
        demo_url: formData.demo_url || null,
        is_active: demo?.is_active ?? true,
      }

      if (demo) {
        await updateDemo(demo.id, demoData)
        toast({
          title: "Demo güncellendi",
          description: "Demo başarıyla güncellendi",
        })
      } else {
        await addDemo(demoData)
        toast({
          title: "Demo eklendi",
          description: "Yeni demo başarıyla eklendi",
        })
      }

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{demo ? "Demo Düzenle" : "Yeni Demo Ekle"}</DialogTitle>
          <DialogDescription>Demo bilgilerini girin ve kaydedin</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={loadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Yükleniyor..." : "Kategori seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Fiyat (₺)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Özellikler (virgülle ayırın)</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="Responsive tasarım, Ödeme entegrasyonu, Ürün yönetimi"
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Teknolojiler (virgülle ayırın)</Label>
            <Textarea
              id="technologies"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              placeholder="Next.js, React, TypeScript, Tailwind CSS"
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Görseller</Label>
            <div className="space-y-3">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                className="cursor-pointer"
              />

              {imagesPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagesPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="group relative aspect-video overflow-hidden rounded-lg border border-border"
                    >
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1 top-1 rounded-full bg-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3 text-destructive-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo_url">Demo URL</Label>
            <Input
              id="demo_url"
              type="url"
              value={formData.demo_url}
              onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
              placeholder="https://demo.example.com"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : demo ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
