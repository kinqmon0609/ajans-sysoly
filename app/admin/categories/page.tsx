"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    display_order: 0,
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [iconSearch, setIconSearch] = useState("")
  const { toast } = useToast()

  // Hazır icon listesi
  const availableIcons = [
    "🌐", "📱", "⚙️", "🛒", "📊", "🏢", "💻", "🎨", "🔧", "📈",
    "🚀", "💡", "🔒", "📞", "✉️", "🎯", "⭐", "🔥", "💎", "🎪",
    "🏆", "📝", "🔍", "💼", "🏠", "🎵", "📷", "🎬", "🎮",
    "🛍️", "🍕", "🏥", "🎓", "🏦", "✈️", "🚗", "🏭", "🌱", "🎭"
  ]

  // Icon filtreleme
  const filteredIcons = availableIcons.filter(icon => 
    iconSearch === "" || icon.includes(iconSearch)
  )

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kategoriler yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "",
        display_order: category.display_order,
        is_active: category.is_active,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: "",
        description: "",
        icon: "",
        display_order: categories.length,
        is_active: true,
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories"
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save category")

      toast({
        title: "Başarılı",
        description: editingCategory ? "Kategori güncellendi" : "Kategori eklendi",
      })

      setDialogOpen(false)
      fetchCategories()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kategori kaydedilemedi",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) return

    try {
      const response = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete category")

      toast({
        title: "Başarılı",
        description: "Kategori silindi",
      })

      fetchCategories()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kategori silinemedi",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kategoriler</h1>
          <p className="text-muted-foreground">Demo kategorilerini yönetin</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kategori
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İkon</TableHead>
                <TableHead>Ad</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="text-2xl">{category.icon}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">{category.description}</TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        category.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {category.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Kategori Düzenle" : "Yeni Kategori"}</DialogTitle>
              <DialogDescription>Kategori bilgilerini girin. Slug otomatik oluşturulacak.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kategori Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Web Sitesi"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">İkon Seçimi</Label>
                <div className="space-y-3">
                  {/* Manuel emoji girişi */}
                  <div>
                    <Label htmlFor="icon-input" className="text-sm text-muted-foreground">
                      Manuel Emoji Girişi
                    </Label>
                    <Input
                      id="icon-input"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="🌐"
                      maxLength={2}
                    />
                  </div>
                  
                  {/* Hazır icon seçimi */}
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Hazır İconlardan Seç
                    </Label>
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="İcon ara..."
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                        {filteredIcons.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon })}
                            className={`p-2 text-lg rounded hover:bg-muted transition-colors ${
                              formData.icon === icon ? 'bg-primary text-primary-foreground' : ''
                            }`}
                            title={icon}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Seçilen icon önizlemesi */}
                  {formData.icon && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <span className="text-sm text-muted-foreground">Seçilen İcon:</span>
                      <span className="text-2xl">{formData.icon}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kategori açıklaması..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Görüntüleme Sırası</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Aktif</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCategory ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
