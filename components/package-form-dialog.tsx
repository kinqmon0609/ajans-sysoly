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
import { useToast } from "@/hooks/use-toast"

export interface Package {
  id: string
  name: string
  description: string | null
  price: number
  features: string[]
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

type PackageFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  package: Package | null
  onSuccess: () => void
}

export function PackageFormDialog({ open, onOpenChange, package: pkg, onSuccess }: PackageFormDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    features: "",
    display_order: "0",
  })

  useEffect(() => {
    if (open) {
      if (pkg) {
        setFormData({
          name: pkg.name || "",
          description: pkg.description || "",
          price: pkg.price?.toString() || "",
          features: (pkg.features || []).join("\n"),
          display_order: pkg.display_order?.toString() || "0",
        })
      } else {
        setFormData({
          name: "",
          description: "",
          price: "",
          features: "",
          display_order: "0",
        })
      }
    }
  }, [pkg, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const packageData = {
        name: formData.name,
        description: formData.description || null,
        price: Number.parseFloat(formData.price),
        features: formData.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        is_active: pkg?.is_active ?? true,
        display_order: Number.parseInt(formData.display_order) || 0,
      }

      const url = pkg ? `/api/packages/${pkg.id}` : "/api/packages"
      const method = pkg ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(packageData),
      })

      if (!response.ok) {
        throw new Error("Failed to save package")
      }

      toast({
        title: pkg ? "Paket güncellendi" : "Paket eklendi",
        description: pkg ? "Paket başarıyla güncellendi" : "Yeni paket başarıyla eklendi",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving package:", error)
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
          <DialogTitle>{pkg ? "Paket Düzenle" : "Yeni Paket Ekle"}</DialogTitle>
          <DialogDescription>Paket bilgilerini girin ve kaydedin</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Paket Adı</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Temel Paket"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Paket açıklaması"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Fiyat (₺)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Özellikler (her satıra bir özellik)</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="5 Sayfa Tasarım&#10;Responsive Tasarım&#10;SEO Optimizasyonu"
              rows={8}
              required
            />
            <p className="text-sm text-muted-foreground">Her özelliği yeni bir satıra yazın</p>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : pkg ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

