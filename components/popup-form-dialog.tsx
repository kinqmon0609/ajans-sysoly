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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"
import Image from "next/image"

export interface Popup {
  id: string
  title: string
  description: string | null
  image_url: string | null
  button_text: string | null
  button_link: string | null
  is_active: boolean
  show_on_homepage: boolean
  start_date: string | null
  end_date: string | null
  display_order: number
  created_at: string
  updated_at: string
}

type PopupFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popup: Popup | null
  onSuccess: () => void
}

export function PopupFormDialog({ open, onOpenChange, popup, onSuccess }: PopupFormDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    button_text: "",
    button_link: "",
    is_active: true,
    show_on_homepage: true,
    start_date: "",
    end_date: "",
    display_order: "0",
  })

  useEffect(() => {
    if (open) {
      if (popup) {
        setFormData({
          title: popup.title || "",
          description: popup.description || "",
          image_url: popup.image_url || "",
          button_text: popup.button_text || "",
          button_link: popup.button_link || "",
          is_active: popup.is_active ?? true,
          show_on_homepage: popup.show_on_homepage ?? true,
          start_date: popup.start_date ? new Date(popup.start_date).toISOString().slice(0, 16) : "",
          end_date: popup.end_date ? new Date(popup.end_date).toISOString().slice(0, 16) : "",
          display_order: popup.display_order?.toString() || "0",
        })
        setImagePreview(popup.image_url)
      } else {
        setFormData({
          title: "",
          description: "",
          image_url: "",
          button_text: "",
          button_link: "",
          is_active: true,
          show_on_homepage: true,
          start_date: "",
          end_date: "",
          display_order: "0",
        })
        setImagePreview(null)
      }
    }
  }, [popup, open])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setFormData({ ...formData, image_url: data.url })
      setImagePreview(data.url)

      toast({
        title: "Başarılı",
        description: "Resim yüklendi",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Resim yüklenirken hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const popupData = {
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url || null,
        button_text: formData.button_text || null,
        button_link: formData.button_link || null,
        is_active: formData.is_active,
        show_on_homepage: formData.show_on_homepage,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        display_order: Number.parseInt(formData.display_order) || 0,
      }

      const url = popup ? `/api/popups/${popup.id}` : "/api/popups"
      const method = popup ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(popupData),
      })

      if (!response.ok) throw new Error("Failed to save popup")

      toast({
        title: popup ? "Popup güncellendi" : "Popup eklendi",
        description: popup ? "Popup başarıyla güncellendi" : "Yeni popup başarıyla eklendi",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving popup:", error)
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{popup ? "Popup Düzenle" : "Yeni Popup Ekle"}</DialogTitle>
          <DialogDescription>Popup bilgilerini girin ve kaydedin</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Örn: Özel İndirim Kampanyası"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Popup açıklaması"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Resim</Label>
            <div className="space-y-3">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image_url: "" })
                      setImagePreview(null)
                    }}
                    className="absolute right-2 top-2 rounded-full bg-destructive p-1"
                  >
                    <X className="h-4 w-4 text-destructive-foreground" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="button_text">Buton Metni</Label>
              <Input
                id="button_text"
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                placeholder="Örn: Teklif Al"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="button_link">Buton Linki</Label>
              <Input
                id="button_link"
                value={formData.button_link}
                onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                placeholder="/teklif-formu"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Başlangıç Tarihi</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Bitiş Tarihi</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Sıralama</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
              placeholder="0"
            />
            <p className="text-sm text-muted-foreground">Küçük sayılar önce görünür</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Aktif</Label>
              <p className="text-sm text-muted-foreground">Popup'ı aktif et</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Anasayfada Göster</Label>
              <p className="text-sm text-muted-foreground">Popup'ı anasayfada göster</p>
            </div>
            <Switch
              checked={formData.show_on_homepage}
              onCheckedChange={(checked) => setFormData({ ...formData, show_on_homepage: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : popup ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}



