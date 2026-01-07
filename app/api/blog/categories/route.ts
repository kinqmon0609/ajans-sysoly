import { NextResponse } from "next/server"

import { getBlogCategories } from "@/lib/mysql/queries"

// 🚀 Cache (10 dakika)
const categoriesCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 dakika

export async function GET() {
  try {
    // Cache kontrolü
    const cached = categoriesCache.get('categories')
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    const categories = await getBlogCategories()
    
    const responseData = { categories }
    
    // Cache'e kaydet
    categoriesCache.set('categories', { data: responseData, timestamp: Date.now() })
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Kategoriler yükleme hatası:", error)
    return NextResponse.json({ error: "Kategoriler yüklenemedi" }, { status: 500 })
  }
}


