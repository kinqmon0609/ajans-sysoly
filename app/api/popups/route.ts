import { getPopups, getAdminPopups, createPopup } from "@/lib/mysql/queries"

import { NextResponse } from "next/server"

// Cache optimizasyonu
const popupsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 dakika

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"
    const cacheKey = `popups-${includeInactive ? 'admin' : 'public'}`
    const now = Date.now()

    // Cache kontrolü
    const cached = popupsCache.get(cacheKey)
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(
        { popups: cached.data },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
            'X-Cache': 'HIT'
          }
        }
      )
    }

    // Admin paneli için tüm popuplar, public için sadece aktif popuplar
    const popups = includeInactive ? await getAdminPopups() : await getPopups()

    // Cache'e kaydet
    popupsCache.set(cacheKey, { data: popups, timestamp: now })

    return NextResponse.json(
      { popups },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
          'X-Cache': 'MISS'
        }
      }
    )
  } catch (error) {
    console.error("Error fetching popups:", error)
    return NextResponse.json({ error: "Popup'lar yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const result = await createPopup(body)
    
    // Cache'i temizle
    popupsCache.clear()
    
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error creating popup:", error)
    return NextResponse.json({ error: "Popup oluşturulurken hata oluştu" }, { status: 500 })
  }
}


