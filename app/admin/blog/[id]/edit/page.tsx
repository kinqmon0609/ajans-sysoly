"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/rich-text-editor"
import { SEOAnalyzer } from "@/components/seo-analyzer"
import { UnsplashImagePicker } from "@/components/unsplash-image-picker"
import { ImageUpload } from "@/components/image-upload"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: string
  name: string
  slug: string
}

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    author: "Admin",
    category_id: "",
    meta_description: "",
    meta_keywords: "",
    focus_keyword: "",
    is_published: false,
    reading_time: 0,
    status: "draft" as "draft" | "published" | "scheduled",
    publish_date: "",
  })
  
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState("")
  const [creatingTag, setCreatingTag] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchTags()
    fetchPost()
  }, [params.id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${params.id}`)
      const data = await response.json()
      
      if (data.post) {
        const publishDate = data.post.publish_date 
          ? new Date(data.post.publish_date).toISOString().slice(0, 16)
          : "";
        
        setFormData({
          title: data.post.title || "",
          slug: data.post.slug || "",
          excerpt: data.post.excerpt || "",
          content: data.post.content || "",
          cover_image: data.post.cover_image || "",
          author: data.post.author || "Admin",
          category_id: data.post.category_id || "",
          meta_description: data.post.meta_description || "",
          meta_keywords: data.post.meta_keywords || "",
          focus_keyword: data.post.focus_keyword || "",
          is_published: data.post.is_published || false,
          reading_time: data.post.reading_time || 0,
          status: data.post.status || "draft",
          publish_date: publishDate,
        })
        
        if (data.post.tags) {
          setSelectedTags(data.post.tags.map((tag: Tag) => tag.id))
        }
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Blog yazısı yüklenemedi",
        variant: "destructive",
      })
    } finally {
      setLoadingPost(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blog/categories")
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Kategoriler yüklenemedi:", error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/blog/tags")
      const data = await response.json()
      setTags(data.tags || [])
    } catch (error) {
      console.error("Etiketler yüklenemedi:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/blog/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tagIds: selectedTags,
        }),
      })

      if (response.ok) {
        toast({
          title: "Başarılı!",
          description: "Blog yazısı güncellendi",
        })
        router.push("/admin/blog")
      } else {
        throw new Error("Blog güncellenemedi")
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Blog yazısı güncellenemedi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)

    try {
      const response = await fetch(`/api/blog/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Başarılı!",
          description: "Blog yazısı silindi",
        })
        router.push("/admin/blog")
      } else {
        throw new Error("Blog silinemedi")
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Blog yazısı silinemedi",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleCreateTag = async () => {
    if (!newTagInput.trim()) {
      toast({
        title: "Hata",
        description: "Etiket adı boş olamaz",
        variant: "destructive",
      })
      return
    }

    setCreatingTag(true)
    try {
      const response = await fetch("/api/blog/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagInput.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        // Yeni etiketi listeye ekle
        setTags(prev => [...prev, data.tag])
        // Yeni etiketi otomatik seç
        setSelectedTags(prev => [...prev, data.tag.id])
        // Input'u temizle
        setNewTagInput("")
        toast({
          title: "Başarılı",
          description: "Yeni etiket eklendi",
        })
      } else {
        throw new Error("Etiket eklenemedi")
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Etiket eklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setCreatingTag(false)
    }
  }

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/blog">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Geri
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Blog Yazısını Düzenle</h1>
                <p className="text-sm text-muted-foreground">{formData.title}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem geri alınamaz. Blog yazısı kalıcı olarak silinecektir.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                      {deleteLoading ? "Siliniyor..." : "Sil"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Slug */}
              <Card>
                <CardHeader>
                  <CardTitle>Temel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Başlık *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Blog yazısı başlığı"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="url-friendly-slug"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Özet *</Label>
                    <Input
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Kısa özet (150-200 karakter)"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cover_image">Kapak Görseli</Label>
                      <UnsplashImagePicker
                        onSelect={(url) => setFormData({ ...formData, cover_image: url })}
                        currentImage={formData.cover_image}
                      />
                    </div>
                    <ImageUpload
                      value={formData.cover_image}
                      onChange={(url) => setFormData({ ...formData, cover_image: url })}
                      label=""
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>İçerik</CardTitle>
                  <CardDescription>Blog yazısının ana içeriği</CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => {
                      setFormData({ ...formData, content: value })
                      const wordCount = value.replace(/<[^>]*>/g, '').split(/\s+/).length
                      const readingTime = Math.ceil(wordCount / 200)
                      setFormData(prev => ({ ...prev, reading_time: readingTime }))
                    }}
                  />
                </CardContent>
              </Card>

              {/* SEO Analyzer */}
              <SEOAnalyzer
                title={formData.title}
                content={formData.content}
                metaDescription={formData.meta_description}
                focusKeyword={formData.focus_keyword}
              />
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Yayın Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Durum</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "draft" | "published" | "scheduled") => {
                        setFormData({ 
                          ...formData, 
                          status: value,
                          is_published: value === "published"
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📝 Taslak</SelectItem>
                        <SelectItem value="published">✅ Yayında</SelectItem>
                        <SelectItem value="scheduled">⏰ Zamanlanmış</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {formData.status === "draft" && "Taslak olarak kaydedilir, yayınlanmaz"}
                      {formData.status === "published" && "Hemen yayınlanır"}
                      {formData.status === "scheduled" && "Belirlediğiniz tarihte otomatik yayınlanır"}
                    </p>
                  </div>

                  {formData.status === "scheduled" && (
                    <div className="space-y-2">
                      <Label htmlFor="publish_date">Yayın Tarihi & Saati</Label>
                      <Input
                        id="publish_date"
                        type="datetime-local"
                        value={formData.publish_date}
                        onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                        required={formData.status === "scheduled"}
                      />
                      <p className="text-xs text-muted-foreground">
                        Bu tarih ve saatte otomatik olarak yayınlanacak
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="author">Yazar</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Yazar adı"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reading_time">Okuma Süresi (dk)</Label>
                    <Input
                      id="reading_time"
                      type="number"
                      value={formData.reading_time}
                      onChange={(e) =>
                        setFormData({ ...formData, reading_time: parseInt(e.target.value) || 0 })
                      }
                      placeholder="5"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category & Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Kategori & Etiketler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Etiketler</Label>
                    
                    {/* Yeni Etiket Ekle */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Yeni etiket yazın..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreateTag()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleCreateTag}
                        disabled={creatingTag || !newTagInput.trim()}
                        size="sm"
                      >
                        {creatingTag ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ekle"}
                      </Button>
                    </div>

                    {/* Mevcut Etiketler */}
                    <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
                      {tags.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Henüz etiket yok. Yukarıdan ekleyebilirsiniz.</p>
                      ) : (
                        tags.map((tag) => (
                          <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={selectedTags.includes(tag.id)}
                              onCheckedChange={() => handleTagToggle(tag.id)}
                            />
                            <label
                              htmlFor={`tag-${tag.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {tag.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {selectedTags.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {selectedTags.length} etiket seçildi
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="focus_keyword">Odak Anahtar Kelime</Label>
                    <Input
                      id="focus_keyword"
                      value={formData.focus_keyword}
                      onChange={(e) => setFormData({ ...formData, focus_keyword: e.target.value })}
                      placeholder="ana anahtar kelime"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Açıklama</Label>
                    <Input
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) =>
                        setFormData({ ...formData, meta_description: e.target.value })
                      }
                      placeholder="150-160 karakter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_keywords">Meta Anahtar Kelimeler</Label>
                    <Input
                      id="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      placeholder="kelime1, kelime2, kelime3"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

