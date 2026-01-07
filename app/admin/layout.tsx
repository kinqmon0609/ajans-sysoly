"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { ActiveVisitorsCounter } from "@/components/active-visitors-counter"
import { useAuth } from "@/lib/auth-context"
import { LayoutDashboard, Package, LogOut, MessageSquare, FolderTree, FileText, Menu, ClipboardList, BarChart3, Settings, Activity, Boxes, Megaphone, Image as ImageIcon, PenTool, Calendar, Mail, RefreshCw, Database, Trash2, Info, Archive, Bug, HardDrive } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface CacheItem {
  key: string
  size: string
  sizeBytes: number
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, loading, logout } = useAuth()
  const [isClearing, setIsClearing] = useState(false)
  const [showCacheDialog, setShowCacheDialog] = useState(false)
  const [cacheItems, setCacheItems] = useState<CacheItem[]>([])
  const [totalSize, setTotalSize] = useState(0)
  const [optimizeDatabase, setOptimizeDatabase] = useState(false)

  useEffect(() => {
    if (!loading && !isAdmin && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [isAdmin, loading, pathname, router])

  const handleOpenCacheDialog = () => {
    try {
      // Cache detaylarını topla
      const cacheKeys = ['menu_cache', 'blog_cache', 'settings_cache']
      const items: CacheItem[] = []
      let total = 0
      
      cacheKeys.forEach(key => {
        const item = localStorage.getItem(key)
        if (item) {
          const sizeInBytes = new Blob([item]).size
          const sizeInKB = (sizeInBytes / 1024).toFixed(2)
          total += parseFloat(sizeInKB)
          items.push({
            key,
            size: sizeInKB,
            sizeBytes: sizeInBytes
          })
        }
      })
      
      setCacheItems(items)
      setTotalSize(total)
      setOptimizeDatabase(false) // Reset checkbox
      setShowCacheDialog(true)
      
    } catch (error) {
      console.error("Cache okuma hatası:", error)
      toast.error("Cache bilgileri okunamadı")
    }
  }

  const handleConfirmClearCache = async () => {
    try {
      setIsClearing(true)
      
      // Cache'leri temizle
      let clearedCount = 0
      cacheItems.forEach(item => {
        localStorage.removeItem(item.key)
        clearedCount++
      })
      
      // SQL Optimize (eğer seçildiyse)
      if (optimizeDatabase) {
        try {
          const response = await fetch('/api/admin/optimize-database', {
            method: 'POST'
          })
          const data = await response.json()
          
          if (data.success) {
            toast.success(`✅ Database optimized!`, {
              description: `${data.results.optimized.length} tablo optimize edildi`
            })
          }
        } catch (error) {
          console.error("Database optimization error:", error)
          toast.warning("Cache temizlendi ama database optimize edilemedi")
        }
      }
      
      setShowCacheDialog(false)
      
      // Başarı mesajı
      const message = optimizeDatabase 
        ? `${clearedCount} cache + Database optimized!`
        : `${clearedCount} cache temizlendi!`
        
      toast.success(message, {
        description: "Sayfa 2 saniye içinde yenilenecek..."
      })
      
      // Hard reload ile yenile
      setTimeout(() => {
        window.location.href = window.location.href
      }, 2000)
      
    } catch (error) {
      console.error("Cache temizleme hatası:", error)
      toast.error("Cache temizlenirken bir hata oluştu")
      setIsClearing(false)
      setShowCacheDialog(false)
    }
  }

  // Login sayfası için normal render
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Loading durumu
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Admin değilse gösterme
  if (!isAdmin) {
    return null
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Anlık Ziyaretçiler", href: "/admin/realtime", icon: Activity },
    { name: "Blog", href: "/admin/blog", icon: PenTool },
    { name: "Demolar", href: "/admin/demos", icon: Package },
    { name: "Paketler", href: "/admin/packages", icon: Boxes },
    { name: "Kategoriler", href: "/admin/categories", icon: FolderTree },
    { name: "Sayfalar", href: "/admin/pages", icon: FileText },
    { name: "Menüler", href: "/admin/menus", icon: Menu },
    { name: "Medya", href: "/admin/media", icon: ImageIcon },
    { name: "Mesajlar", href: "/admin/messages", icon: MessageSquare },
    { name: "Teklif Talepleri", href: "/admin/quote-requests", icon: ClipboardList },
    { name: "Randevular", href: "/admin/appointments", icon: Calendar },
    { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
    { name: "Popup'lar", href: "/admin/popups", icon: Megaphone },
    { name: "Yedekleme", href: "/admin/backup", icon: Archive },
    { name: "JSON Storage", href: "/admin/json-storage", icon: HardDrive },
    { name: "Debug", href: "/admin/debug", icon: Bug },
    { name: "Ayarlar", href: "/admin/settings", icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="relative flex w-64 flex-col border-r border-border bg-muted/30">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-lg font-semibold">Admin Panel</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4">
          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Top Bar */}
        <div className="border-b border-border bg-background">
          <div className="flex h-16 items-center justify-between px-8">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Siteye Dön</Link>
            </Button>
            <div className="flex items-center gap-3">
              <ActiveVisitorsCounter />
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenCacheDialog}
                disabled={isClearing}
                className="gap-2"
                title="Önbelleği Temizle"
              >
                <RefreshCw className={cn("h-4 w-4", isClearing && "animate-spin")} />
                {isClearing ? "Temizleniyor..." : "Cache Temizle"}
              </Button>
              <NotificationsDropdown />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8">{children}</div>
      </main>

      {/* Cache Temizleme Dialog */}
      <Dialog open={showCacheDialog} onOpenChange={setShowCacheDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Database className="h-5 w-5 text-primary" />
              Cache Yönetimi
            </DialogTitle>
            <DialogDescription>
              LocalStorage'da kayıtlı cache verilerini görüntüleyin ve temizleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {cacheItems.length > 0 ? (
              <>
                <div className="space-y-3">
                  {cacheItems.map((item, index) => (
                    <Card key={item.key} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Database className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {item.key.replace('_cache', '').replace('_', ' ').toUpperCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.key}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="font-mono">
                            {item.size} KB
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Toplam */}
                <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Toplam Cache Boyutu</span>
                  </div>
                  <Badge variant="default" className="font-mono text-base px-3 py-1">
                    {totalSize.toFixed(2)} KB
                  </Badge>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Database className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-lg font-medium text-muted-foreground">
                  Hiç cache bulunamadı
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  LocalStorage temiz görünüyor
                </p>
              </div>
            )}
            
            {/* SQL Optimize Option */}
            <div className="flex items-center space-x-2 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
              <Checkbox 
                id="optimize-db" 
                checked={optimizeDatabase}
                onCheckedChange={(checked) => setOptimizeDatabase(checked as boolean)}
              />
              <Label 
                htmlFor="optimize-db" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                🚀 <strong>Database'i de optimize et</strong> (OPTIMIZE + ANALYZE tables)
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCacheDialog(false)}
              disabled={isClearing}
            >
              İptal
            </Button>
            {cacheItems.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleConfirmClearCache}
                disabled={isClearing}
                className="gap-2"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Temizleniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Tümünü Temizle
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

