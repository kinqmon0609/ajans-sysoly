"use client"

import type React from "react"
import { useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { 
  LayoutDashboard, 
  Package, 
  LogOut, 
  MessageSquare, 
  FolderTree, 
  FileText,
  BarChart3,
  Box,
  Menu,
  BookOpen,
  Image as ImageIcon,
  Bell,
  Settings,
  ClipboardList,
  Users,
  Calendar,
  Mail,
  Shield,
  Database,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearCache = () => {
    setIsClearing(true)
    try {
      // LocalStorage cache'lerini temizle
      const cacheKeys = ['menu_cache', 'blog_cache', 'settings_cache']
      cacheKeys.forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Başarı mesajı
      toast.success("Cache başarıyla temizlendi! Sayfa yenileniyor...", {
        description: "Tüm önbellekler temizlendi."
      })
      
      // 1 saniye sonra sayfayı yenile
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Cache temizleme hatası:", error)
      toast.error("Cache temizlenirken bir hata oluştu")
      setIsClearing(false)
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Kullanıcılar", href: "/admin/users", icon: Users },
    { name: "Blog", href: "/admin/blog", icon: BookOpen },
    { name: "Demolar", href: "/admin/demos", icon: Package },
    { name: "Paketler", href: "/admin/packages", icon: Box },
    { name: "Kategoriler", href: "/admin/categories", icon: FolderTree },
    { name: "Sayfalar", href: "/admin/pages", icon: FileText },
    { name: "Menüler", href: "/admin/menus", icon: Menu },
    { name: "Medya", href: "/admin/media", icon: ImageIcon },
    { name: "Mesajlar", href: "/admin/messages", icon: MessageSquare },
    { name: "Teklif Talepleri", href: "/admin/quote-requests", icon: ClipboardList },
    { name: "Randevular", href: "/admin/appointments", icon: Calendar },
    { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
    { name: "Pop-up'lar", href: "/admin/popups", icon: Bell },
    { name: "Güvenlik", href: "/admin/security", icon: Shield },
    { name: "Yedekler", href: "/admin/backups", icon: Database },
    { name: "Ayarlar", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-muted/30">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-lg font-semibold">Admin Panel</span>
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full justify-start bg-transparent" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="border-b border-border bg-background">
          <div className="flex h-16 items-center justify-between px-8">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Siteye Dön</Link>
            </Button>
            <div className="flex items-center gap-2">
              {/* Cache Temizleme Butonu */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
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
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
