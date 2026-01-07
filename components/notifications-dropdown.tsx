"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Check, Loader2, MessageSquare, Package, AlertCircle, ClipboardList } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [prevUnreadCount, setPrevUnreadCount] = useState(-1) // -1 = henüz yüklenmedi
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // AudioContext'i başlat
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = ctx
      
      console.log("🔊 AudioContext oluşturuldu, state:", ctx.state)
      
      // Kullanıcı ilk tıklama yaptığında ses çalabilmesi için resume et
      const resumeAudio = () => {
        if (ctx.state === 'suspended') {
          ctx.resume().then(() => {
            console.log("🔊 AudioContext aktif edildi (ilk tıklama)")
          })
        }
      }
      
      // Birden fazla event dinleyici ekle
      const events = ['click', 'touchstart', 'keydown']
      events.forEach(event => {
        document.addEventListener(event, resumeAudio, { once: true })
      })
      
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resumeAudio)
        })
      }
    } catch (error) {
      console.error("AudioContext başlatılamadı:", error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 120000) // 2 dakikada bir kontrol et (performans için)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const newNotifications = data.notifications || []
      const newUnreadCount = newNotifications.filter((n: Notification) => !n.is_read).length || 0
      
      setNotifications(newNotifications)
      
      // Yeni bildirim geldi mi kontrol et (ilk yükleme değilse ve sayı arttıysa)
      if (prevUnreadCount !== -1 && newUnreadCount > prevUnreadCount) {
        console.log("🆕 Yeni bildirim tespit edildi!", {
          prevCount: prevUnreadCount,
          newCount: newUnreadCount,
          diff: newUnreadCount - prevUnreadCount
        })
        
        setHasNewNotification(true)
        
        // Ses çalmayı promise ile senkron hale getir
        setTimeout(() => {
          playNotificationSound()
        }, 100)
        
        // Animasyonu 2 saniye sonra kaldır
        setTimeout(() => setHasNewNotification(false), 2000)
        
        // Toast göster - en yeni okunmamış bildirimi göster
        const latestUnreadNotification = newNotifications.find((n: Notification) => !n.is_read)
        if (latestUnreadNotification) {
          toast({
            title: latestUnreadNotification.title,
            description: latestUnreadNotification.message,
          })
        }
      }
      
      setUnreadCount(newUnreadCount)
      setPrevUnreadCount(newUnreadCount)
    } catch (error) {
      // Sessizce hata ver, console'u spam'leme
      if (loading) {
        console.warn("Bildirimler yüklenemedi")
      }
      // Hata durumunda boş array set et, crash etmesin
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const playNotificationSound = () => {
    const audioContext = audioContextRef.current
    
    if (!audioContext) {
      console.warn("⚠️ AudioContext henüz hazır değil")
      return
    }

    console.log("🎵 Ses çalma denemesi, AudioContext state:", audioContext.state)

    try {
      // AudioContext suspended durumundaysa resume et
      if (audioContext.state === 'suspended') {
        console.log("⏸️ AudioContext suspended, resume ediliyor...")
        audioContext.resume().then(() => {
          console.log("🔊 AudioContext aktif edildi (resume)")
          playSoundWithContext()
        }).catch((error) => {
          console.error("AudioContext resume hatası:", error)
        })
      } else {
        playSoundWithContext()
      }
    } catch (error) {
      console.error("Ses çalma hatası:", error)
    }
  }

  const playSoundWithContext = () => {
    const audioContext = audioContextRef.current
    if (!audioContext) return

    try {
      // İki tonlu bildirim sesi (daha fark edilir)
      const playBeep = (frequency: number, startTime: number, duration: number) => {
        if (!audioContext) return
        
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.5, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }
      
      // İki kısa bip sesi (notification style)
      const currentTime = audioContext.currentTime
      playBeep(800, currentTime, 0.15)
      playBeep(1000, currentTime + 0.2, 0.15)
      
      console.log("🔔 Bildirim sesi çalındı! (AudioContext state:", audioContext.state, ")")
    } catch (error) {
      console.error("Ses çalma hatası:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      })
      fetchNotifications()
    } catch (error) {
      console.error("Bildirim okundu işaretleme hatası:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      })
      toast({
        title: "Başarılı",
        description: "Tüm bildirimler okundu olarak işaretlendi",
      })
      fetchNotifications()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bildirimler işaretlenemedi",
        variant: "destructive",
      })
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "new_message":
        return <MessageSquare className="h-4 w-4" />
      case "new_comment":
        return <MessageSquare className="h-4 w-4" />
      case "new_demo":
        return <Package className="h-4 w-4" />
      case "new_quote":
        return <ClipboardList className="h-4 w-4" />
      case "system":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={`h-5 w-5 ${hasNewNotification ? 'animate-bounce text-blue-600' : ''}`} />
          {unreadCount > 0 && (
            <span className={`absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ${hasNewNotification ? 'animate-pulse' : ''}`}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Bildirimler</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs">
              <Check className="mr-1 h-3 w-3" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Bildirim yok</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex cursor-pointer flex-col items-start gap-1 p-3 ${!notification.is_read ? "bg-muted/50" : ""}`}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id)
                  }
                }}
                asChild={!!notification.link}
              >
                {notification.link ? (
                  <Link href={notification.link} className="w-full">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                  </Link>
                ) : (
                  <div className="flex w-full items-start gap-2">
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
