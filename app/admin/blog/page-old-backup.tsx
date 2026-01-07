"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  FileText,
  TrendingUp
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  author: string
  meta_description: string | null
  meta_keywords: string | null
  focus_keyword: string | null
  category_id: string | null
  category_name?: string
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  reading_time: number
  view_count: number
  seo_score: number
}

export default function AdminBlogPage() {
  const { toast } = useToast()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/blog?includeUnpublished=true")
      if (!response.ok) throw new Error("Failed to fetch posts")
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Hata",
        description: "Blog yazıları yüklenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/blog/categories")
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/blog/tags")
      const data = await response.json()
      setTags(data.tags || [])
    } catch (error) {
      console.error("Error fetching tags:", error)
    }
  }

  const handleOpenForm = (post?: BlogPost) => {
    if (post) {
      setSelectedPost(post)
      setFormData({
        title: post.title,
        excerpt: post.excerpt || "",
        content: post.content,
        cover_image: post.cover_image || "",
        category_id: post.category_id || "",
        meta_description: post.meta_description || "",
        meta_keywords: post.meta_keywords || "",
        focus_keyword: post.focus_keyword || "",
        is_published: post.is_published,
      })
      // Fetch post tags
      fetch(`/api/blog/${post.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.post?.tags) {
            setSelectedTags(data.post.tags.map((t: Tag) => t.id))
          }
        })
    } else {
      setSelectedPost(null)
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        cover_image: "",
        category_id: "",
        meta_description: "",
        meta_keywords: "",
        focus_keyword: "",
        is_published: false,
      })
      setSelectedTags([])
    }
    setIsFormOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Hata",
        description: "Başlık zorunludur",
        variant: "destructive",
      })
      return
    }

    // Calculate reading time and SEO score
    const wordCount = formData.content.split(/\s+/).length
    const reading_time = Math.ceil(wordCount / 200)
    
    // SEO score calculation
    let seo_score = 0
    if (formData.title.length >= 50 && formData.title.length <= 60) seo_score += 20
    else if (formData.title.length >= 40 && formData.title.length <= 70) seo_score += 15
    
    if (formData.meta_description.length >= 150 && formData.meta_description.length <= 160) seo_score += 20
    else if (formData.meta_description.length >= 140 && formData.meta_description.length <= 170) seo_score += 15
    
    if (wordCount >= 300) seo_score += 25
    
    const keywordInContent = formData.focus_keyword && formData.content.toLowerCase().includes(formData.focus_keyword.toLowerCase())
    const keywordInTitle = formData.focus_keyword && formData.title.toLowerCase().includes(formData.focus_keyword.toLowerCase())
    if (keywordInContent && keywordInTitle) seo_score += 25
    else if (keywordInContent) seo_score += 15
    
    seo_score += 10 // Base score

    setIsSaving(true)
    try {
      const postData = {
        ...formData,
        reading_time,
        seo_score: Math.round(seo_score),
        tagIds: selectedTags,
      }

      const url = selectedPost
        ? `/api/blog/${selectedPost.id}`
        : "/api/blog"
      const method = selectedPost ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (!response.ok) throw new Error("Failed to save post")

      toast({
        title: "Başarılı",
        description: selectedPost
          ? "Blog yazısı güncellendi"
          : "Blog yazısı oluşturuldu",
      })

      setIsFormOpen(false)
      fetchPosts()
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        title: "Hata",
        description: "Blog yazısı kaydedilirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPost) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/blog/${selectedPost.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete post")

      toast({
        title: "Başarılı",
        description: "Blog yazısı silindi",
      })

      setIsDeleteOpen(false)
      fetchPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Hata",
        description: "Blog yazısı silinirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTagSelection = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSEOBadgeColor = (score: number) => {
    if (score >= 75) return "bg-green-500"
    if (score >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Yönetimi</h1>
          <p className="text-muted-foreground">
            Blog yazıları görüntüleyin ve yönetin
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Blog Yazısı
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Blog ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-center">SEO Puanı</TableHead>
                <TableHead className="text-center">Görüntülenme</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Henüz blog yazısı yok</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="font-medium">{post.title}</div>
                    </TableCell>
                    <TableCell>
                      {post.category_name && (
                        <Badge variant="outline">{post.category_name}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getSEOBadgeColor(post.seo_score)}>
                        {post.seo_score}/100
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.view_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.is_published ? (
                        <Badge className="bg-green-500">Yayında</Badge>
                      ) : (
                        <Badge variant="secondary">Taslak</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPost(post)
                            setIsDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPost ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı"}
            </DialogTitle>
            <DialogDescription>
              Blog yazısı bilgilerini girin. CKEditor benzeri editör ile içerik oluşturun.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Blog başlığı"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="excerpt">Özet</Label>
              <Input
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Kısa özet (blog listesinde görünür)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
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

            <div className="grid gap-2">
              <Label>Etiketler</Label>
              <div className="flex flex-wrap gap-2 border rounded-md p-3">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={() => toggleTagSelection(tag.id)}
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer">
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">İçerik *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) =>
                  setFormData({ ...formData, content })
                }
                placeholder="Blog içeriğini buraya yazın..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cover_image">Kapak Görseli URL</Label>
              <Input
                id="cover_image"
                value={formData.cover_image}
                onChange={(e) =>
                  setFormData({ ...formData, cover_image: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="focus_keyword">Odak Anahtar Kelime</Label>
              <Input
                id="focus_keyword"
                value={formData.focus_keyword}
                onChange={(e) =>
                  setFormData({ ...formData, focus_keyword: e.target.value })
                }
                placeholder="SEO için ana anahtar kelime"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meta_description">Meta Açıklama</Label>
              <Input
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({ ...formData, meta_description: e.target.value })
                }
                placeholder="Arama motorlarında görünecek açıklama (150-160 karakter)"
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {formData.meta_description.length}/160 karakter
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meta_keywords">Meta Anahtar Kelimeler</Label>
              <Input
                id="meta_keywords"
                value={formData.meta_keywords}
                onChange={(e) =>
                  setFormData({ ...formData, meta_keywords: e.target.value })
                }
                placeholder="anahtar1, anahtar2, anahtar3"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_published: checked })
                }
              />
              <Label htmlFor="is_published">Yayınla</Label>
            </div>

            {/* SEO Analyzer */}
            <SEOAnalyzer
              title={formData.title}
              metaDescription={formData.meta_description}
              content={formData.content}
              focusKeyword={formData.focus_keyword}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              disabled={isSaving}
            >
              İptal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedPost ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu blog yazısını silmek üzeresiniz. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
