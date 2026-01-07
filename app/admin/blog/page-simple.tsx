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
  AlertDialogTrigger,
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
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDelete = async (postId: string) => {
    setDeleteLoading(true)
    setDeletingId(postId)

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Başarılı!",
          description: "Blog yazısı silindi",
        })
        fetchPosts()
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
      setDeletingId(null)
    }
  }

  const togglePublish = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !post.is_published }),
      })

      if (response.ok) {
        toast({
          title: "Başarılı!",
          description: post.is_published ? "Yayından kaldırıldı" : "Yayınlandı",
        })
        fetchPosts()
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız",
        variant: "destructive",
      })
    }
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
        <Link href="/admin/blog/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Blog Yazısı
          </Button>
        </Link>
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
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Henüz blog yazısı yok</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            İlk blog yazınızı oluşturarak başlayın
          </p>
          <Link href="/admin/blog/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Blog Yazısı
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Yazar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>SEO</TableHead>
                <TableHead>Görüntülenme</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <div className="max-w-[300px]">
                      <div className="truncate">{post.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        /{post.slug}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.category_name ? (
                      <Badge variant="outline">{post.category_name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{post.author}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={post.is_published ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => togglePublish(post)}
                    >
                      {post.is_published ? (
                        <>
                          <Eye className="mr-1 h-3 w-3" />
                          Yayında
                        </>
                      ) : (
                        <>
                          <EyeOff className="mr-1 h-3 w-3" />
                          Taslak
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${getSEOBadgeColor(post.seo_score)}`}
                      />
                      <span className="text-sm">{post.seo_score}/100</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{post.view_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/blog/${post.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deleteLoading && deletingId === post.id}
                          >
                            {deleteLoading && deletingId === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu işlem geri alınamaz. &quot;{post.title}&quot; kalıcı olarak
                              silinecek.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(post.id)}>
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">{posts.length}</div>
          <div className="text-sm text-muted-foreground">Toplam Yazı</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {posts.filter((p) => p.is_published).length}
          </div>
          <div className="text-sm text-muted-foreground">Yayında</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-bold">
            {posts.reduce((sum, p) => sum + (p.view_count || 0), 0)}
          </div>
          <div className="text-sm text-muted-foreground">Toplam Görüntülenme</div>
        </div>
      </div>
    </div>
  )
}

