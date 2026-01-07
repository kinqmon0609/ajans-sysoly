"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  Loader2, 
  HardDrive, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  File,
  Filter,
  Upload as UploadIcon
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface MediaFile {
  name: string
  path: string
  size: number
  sizeFormatted: string
  type: string
  uploadedAt: string
}

interface MediaStats {
  totalSize: number
  totalSizeFormatted: string
  totalFiles: number
  fileTypes: {
    images: number
    videos: number
    documents: number
    others: number
  }
}

export default function MediaPage() {
  const { toast } = useToast()
  const [files, setFiles] = useState<MediaFile[]>([])
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [deleteFile, setDeleteFile] = useState<MediaFile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const [filesRes, statsRes] = await Promise.all([
        fetch("/api/media"),
        fetch("/api/media?action=stats"),
      ])

      if (filesRes.ok && statsRes.ok) {
        const filesData = await filesRes.json()
        const statsData = await statsRes.json()
        setFiles(filesData.files || [])
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching media:", error)
      toast({
        title: "Hata",
        description: "Medya dosyaları yüklenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const handleDelete = async () => {
    if (!deleteFile) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/media?file=${encodeURIComponent(deleteFile.name)}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete file")

      toast({
        title: "Dosya silindi",
        description: `${deleteFile.name} başarıyla silindi`,
      })

      fetchMedia()
      setDeleteFile(null)
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Hata",
        description: "Dosya silinirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || file.type === filterType
    return matchesSearch && matchesType
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "document":
        return <FileText className="h-5 w-5" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-500/10 text-blue-500"
      case "video":
        return "bg-purple-500/10 text-purple-500"
      case "document":
        return "bg-green-500/10 text-green-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Medya Yönetimi</h1>
        <p className="text-muted-foreground">Yüklenen dosyaları görüntüleyin ve yönetin</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Boyut</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSizeFormatted}</div>
              <p className="text-xs text-muted-foreground">Disk kullanımı</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resimler</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fileTypes.images}</div>
              <p className="text-xs text-muted-foreground">Görsel dosyaları</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videolar</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fileTypes.videos}</div>
              <p className="text-xs text-muted-foreground">Video dosyaları</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Dosya</CardTitle>
              <File className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
              <p className="text-xs text-muted-foreground">Tüm dosyalar</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Dosya ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Dosyalar</SelectItem>
              <SelectItem value="image">Resimler</SelectItem>
              <SelectItem value="video">Videolar</SelectItem>
              <SelectItem value="document">Dökümanlar</SelectItem>
              <SelectItem value="other">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <File className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Dosya bulunamadı</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredFiles.map((file) => (
            <Card key={file.name} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative aspect-square bg-muted">
                {file.type === "image" ? (
                  <Image
                    src={file.path}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className={`rounded-full p-4 ${getFileTypeColor(file.type)}`}>
                      {getFileIcon(file.type)}
                    </div>
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    asChild
                    title="Görüntüle"
                  >
                    <a href={file.path} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    asChild
                    title="İndir"
                  >
                    <a href={file.path} download={file.name}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setDeleteFile(file)}
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <p className="font-medium truncate mb-1" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{file.sizeFormatted}</span>
                  <Badge variant="outline" className="capitalize">
                    {file.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(file.uploadedAt).toLocaleDateString("tr-TR")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFile} onOpenChange={(open) => !open && setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dosyayı silmek istediğinizden emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. <strong>{deleteFile?.name}</strong> kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}



