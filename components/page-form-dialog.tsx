"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { usePages, type Page } from "@/lib/pages-context"
import { Loader2 } from "lucide-react"

interface PageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: Page | null
}

export function PageFormDialog({ open, onOpenChange, page }: PageFormDialogProps) {
  const { createPage, updatePage } = usePages()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "[]",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    is_active: true,
    display_order: 0,
  })

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title,
        slug: page.slug,
        description: page.description || "",
        content: JSON.stringify(page.content, null, 2),
        meta_title: page.meta_title || "",
        meta_description: page.meta_description || "",
        meta_keywords: page.meta_keywords || "",
        is_active: page.is_active,
        display_order: page.display_order,
      })
    } else {
      setFormData({
        title: "",
        slug: "",
        description: "",
        content: "[]",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        is_active: true,
        display_order: 0,
      })
    }
  }, [page, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let contentJson
      try {
        contentJson = JSON.parse(formData.content)
      } catch {
        alert("İçerik JSON formatında olmalıdır")
        setLoading(false)
        return
      }

      const pageData = {
        ...formData,
        content: contentJson,
      }

      if (page) {
        await updatePage(page.id, pageData)
      } else {
        await createPage(pageData)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error saving page:", error)
      alert("Sayfa kaydedilirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{page ? "Sayfa Düzenle" : "Yeni Sayfa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              placeholder="ornek-sayfa"
              required
            />
            <p className="text-xs text-muted-foreground">URL: /{formData.slug}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">İçerik (JSON) *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              İçerik JSON formatında olmalıdır. Örnek yapılar için mevcut sayfaları inceleyin.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Başlık (SEO)</Label>
              <Input
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Sıra</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Açıklama (SEO)</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_keywords">Meta Anahtar Kelimeler (SEO)</Label>
            <Input
              id="meta_keywords"
              value={formData.meta_keywords}
              onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
              placeholder="anahtar, kelime, listesi"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Aktif</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {page ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
