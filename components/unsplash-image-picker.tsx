"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Image as ImageIcon, Download, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  user: {
    name: string
    username: string
    links: {
      html: string
    }
  }
  links: {
    download_location: string
  }
}

interface UnsplashImagePickerProps {
  onSelect: (imageUrl: string) => void
  currentImage?: string
}

export function UnsplashImagePicker({ onSelect, currentImage }: UnsplashImagePickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const { toast } = useToast()

  const searchImages = async (query: string) => {
    if (!query.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen arama kelimesi girin",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setApiKeyMissing(false)
    try {
      const response = await fetch(`/api/unsplash/search?query=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // API key yoksa özel durumu handle et
        if (errorData.error && errorData.error.includes("tanımlanmamış")) {
          setApiKeyMissing(true)
          setImages([])
          return
        }
        
        throw new Error(errorData.error || "Arama başarısız")
      }

      const data = await response.json()
      
      // API key yoksa kullanıcıya bilgi ver
      if (data.error) {
        setApiKeyMissing(true)
        setImages([])
        return
      }
      
      setImages(data.results || [])

      if (data.results.length === 0) {
        toast({
          title: "Sonuç Bulunamadı",
          description: "Bu arama için görsel bulunamadı. Başka bir kelime deneyin.",
        })
      }
    } catch (error) {
      console.error("Unsplash search error:", error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Görseller yüklenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (image: UnsplashImage) => {
    const imageUrl = `${image.urls.regular}&w=1200&h=630&fit=crop`
    setSelectedImage(imageUrl)
    onSelect(imageUrl)
    
    // Trigger download endpoint (Unsplash API guideline)
    fetch(`/api/unsplash/download?url=${encodeURIComponent(image.links.download_location)}`)
      .catch(console.error)

    toast({
      title: "Başarılı!",
      description: "Görsel seçildi",
    })

    setOpen(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchImages(searchQuery)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" title="Unsplash'dan Görsel Seç">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Unsplash&apos;dan Görsel Seç</DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Örn: technology, business, nature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={() => searchImages(searchQuery)} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Ara"
            )}
          </Button>
        </div>

        {/* Current Image Preview */}
        {currentImage && !loading && images.length === 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Mevcut Görsel:</p>
            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
              <Image
                src={currentImage}
                alt="Current image"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Images Grid */}
        {!loading && images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all hover:ring-2 hover:ring-primary"
                onClick={() => handleSelect(image)}
              >
                <Image
                  src={image.urls.small}
                  alt={image.alt_description || "Unsplash image"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">
                    by {image.user.name}
                  </p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="h-4 w-4 text-white drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API Key Missing State */}
        {apiKeyMissing && !loading && (
          <div className="text-center py-12 px-4">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unsplash API Key Gerekli</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Unsplash üzerinden görsel aramak için bir API anahtarına ihtiyacınız var.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-left max-w-md mx-auto mb-4">
              <p className="text-xs font-mono mb-2">1. Unsplash&apos;a kaydolun:</p>
              <a 
                href="https://unsplash.com/developers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 mb-3"
              >
                https://unsplash.com/developers
                <ExternalLink className="h-3 w-3" />
              </a>
              <p className="text-xs font-mono mb-2">2. .env dosyanıza ekleyin:</p>
              <code className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded block">
                UNSPLASH_ACCESS_KEY=&quot;your-key-here&quot;
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              API key&apos;i ekledikten sonra sunucuyu yeniden başlatın.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !apiKeyMissing && images.length === 0 && searchQuery === "" && (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unsplash'dan Görsel Seçin</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Arama yaparak milyonlarca ücretsiz, yüksek kaliteli görsele erişin
            </p>
            <p className="text-xs text-muted-foreground">
              Örnek aramalar: technology, business, nature, city, food
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
          <p>
            Görseller{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground inline-flex items-center gap-1"
            >
              Unsplash
              <ExternalLink className="h-3 w-3" />
            </a>{" "}
            tarafından sağlanmaktadır
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

