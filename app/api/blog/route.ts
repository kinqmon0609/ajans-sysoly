import { type NextRequest, NextResponse } from "next/server"

import { getBlogPosts, createBlogPost, setBlogPostTags } from "@/lib/mysql/queries"

// 🚀 Cache (5 dakika)
const blogCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Blog API çağrıldı")
    
    // Önce gerçek veritabanını dene
    const pool = dbPool
    const [rows] = await pool.execute(`
      SELECT * FROM blog 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `)
    
    console.log("✅ Blog veritabanından alındı:", (rows as any).length)
    
    const blogData = {
      posts: rows
    }
    
    return NextResponse.json(blogData)
    
  } catch (error) {
    console.error("❌ Blog fetch error:", error)
    console.log("🔄 Mock data kullanılıyor")
    
    // Mock data fallback
    const mockBlogData = {
      posts: [
        {
          id: 'b1c2d3e4-f5a6-7890-1234-567890abcdef',
          title: 'Web Tasarım Trendleri 2024',
          slug: 'web-tasarim-trendleri-2024',
          category: 'Web Sitesi',
          description: '2024 yılının en popüler web tasarım trendleri ve ipuçları.',
          content: [
            { type: 'heading', level: 2, text: 'Minimalist Tasarım' },
            { type: 'paragraph', text: 'Daha az öğe, daha fazla odak.' },
            { type: 'heading', level: 2, text: 'Koyu Mod' },
            { type: 'paragraph', text: 'Göz yorgunluğunu azaltan popüler bir seçenek.' }
          ],
          image: '/placeholder.svg',
          meta_title: 'Web Tasarım Trendleri 2024',
          meta_description: '2024 web tasarım trendleri hakkında bilgi edinin.',
          meta_keywords: 'web tasarım, trendler, 2024, minimalist, koyu mod',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
    
    return NextResponse.json(mockBlogData)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const tagIds = body.tagIds
    delete body.tagIds // Remove from body as it's not a column in blog_posts
    
    const result:any = await createBlogPost(body)
    
    // Set tags if provided
    if (tagIds && tagIds.length > 0 && result.insertId) {
      await setBlogPostTags(result.insertId, tagIds)
    }
    
    // Cache'i temizle (yeni post eklendi)
    blogCache.clear()
    
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Blog yazısı oluşturma hatası:", error)
    return NextResponse.json({ error: "Blog yazısı oluşturulamadı" }, { status: 500 })
  }
}
