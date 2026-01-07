import { NextResponse } from "next/server"

import { getBlogTags, createBlogTag } from "@/lib/mysql/queries"

// 🚀 Cache (10 dakika)
const tagsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 dakika

export async function GET() {
  try {
    // Cache kontrolü
    const cached = tagsCache.get('tags')
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    const tags = await getBlogTags()
    
    const responseData = { tags }
    
    // Cache'e kaydet
    tagsCache.set('tags', { data: responseData, timestamp: Date.now() })
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Etiketler yükleme hatası:", error)
    return NextResponse.json({ error: "Etiketler yüklenemedi" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Etiket adı gereklidir" },
        { status: 400 }
      )
    }

    const tag = await createBlogTag(name.trim())
    
    // Cache'i temizle (yeni tag eklendi)
    tagsCache.clear()
    
    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    console.error("Etiket oluşturma hatası:", error)
    return NextResponse.json(
      { error: "Etiket oluşturulamadı" },
      { status: 500 }
    )
  }
}

