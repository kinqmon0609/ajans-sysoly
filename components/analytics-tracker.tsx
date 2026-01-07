"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// Her kullanıcı için benzersiz ID oluştur ve localStorage'da sakla
function getVisitorId(): string {
  if (typeof window === "undefined") return ""
  
  let visitorId = localStorage.getItem("visitor_id")
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("visitor_id", visitorId)
  }
  return visitorId
}

// Son track edilen sayfa ve zamanı sakla (duplicate önlemek için)
let lastTrackedPage: string | null = null
let lastTrackedTime = 0
const TRACK_COOLDOWN = 10000 // 10 saniye içinde aynı sayfayı tekrar track etme

// React Strict Mode'da duplicate render'ı önlemek için
let trackingInProgress = false

export function AnalyticsTracker() {
  const pathname = usePathname()
  const hasTracked = useRef(false)

  useEffect(() => {
    // Admin panelinde tracking yapma
    if (pathname?.startsWith("/admin")) return

    // Bu pathname için zaten track edildi mi?
    if (hasTracked.current) {
      return
    }

    const trackPageView = async () => {
      try {
        // Duplicate tracking önle - agresif kontrol
        const now = Date.now()
        
        // 1. Aynı sayfa ve cooldown süresi dolmadıysa skip
        if (lastTrackedPage === pathname && now - lastTrackedTime < TRACK_COOLDOWN) {
          console.log("⏭️ Cooldown: Skipping duplicate:", pathname)
          return
        }

        // 2. Tracking işlemi zaten devam ediyorsa skip
        if (trackingInProgress) {
          console.log("⏭️ In Progress: Skipping duplicate:", pathname)
          return
        }

        trackingInProgress = true
        const visitorId = getVisitorId()
        
        // Sayfa tipini belirle
        let pageType = "other"
        let demoId = null
        
        if (pathname === "/") {
          pageType = "home"
        } else if (pathname?.startsWith("/demo/")) {
          pageType = "demo"
          const id = pathname.split("/demo/")[1]
          demoId = parseInt(id) || null
        } else if (pathname) {
          pageType = "page"
        }

        // Track işlemini yap
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: pathname || "",
            title: document.title,
            type: pageType,
            demoId,
            visitorId,
            referrer: document.referrer || null,
          }),
        })

        // Son track bilgilerini güncelle
        lastTrackedPage = pathname
        lastTrackedTime = now
        hasTracked.current = true
        
        console.log("✅ Tracked page view:", pathname)
      } catch (error) {
        console.error("❌ Analytics tracking failed:", error)
      } finally {
        trackingInProgress = false
      }
    }

    // Küçük bir delay ile track et (React Strict Mode double render'ı atlatmak için)
    const timeoutId = setTimeout(() => {
      trackPageView()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname])

  return null
}

