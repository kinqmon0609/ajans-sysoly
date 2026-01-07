import { NextResponse } from "next/server"
import dbPool from "@/lib/mysql/client"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli

// Mock data import
const mockDemos = [
  {
    id: "demo-1",
    title: "Modern E-Ticaret Sitesi",
    description: "Responsive tasarım, güvenli ödeme sistemi ve admin paneli ile tam özellikli e-ticaret sitesi.",
    category: "E-Ticaret",
    price: 25000,
    demo_url: "https://demo1.example.com",
    is_active: true,
    images: ["/placeholder.svg", "/placeholder.svg"],
    features: ["Responsive Tasarım", "Güvenli Ödeme", "Admin Panel", "SEO Optimizasyonu"],
    technologies: ["React", "Next.js", "Node.js", "MySQL"]
  },
  {
    id: "demo-2", 
    title: "Kurumsal Web Sitesi",
    description: "Profesyonel kurumsal kimlik ve modern tasarım ile işletmenizi dijitale taşıyın.",
    category: "Kurumsal",
    price: 15000,
    demo_url: "https://demo2.example.com",
    is_active: true,
    images: ["/placeholder.svg", "/placeholder.svg"],
    features: ["Modern Tasarım", "Hızlı Yükleme", "SEO Dostu", "Mobil Uyumlu"],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"]
  }
]

// Single demo cache - OPTIMIZED (smaller cache size)
const singleDemoCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika
const MAX_CACHE_ENTRIES = 50 // Limit cache size

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const now = Date.now()
    
    // Cache kontrolü - önce cache'e bak
    const cached = singleDemoCache.get(id)
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(
        { demo: cached.data },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache': 'HIT'
          },
        }
      )
    }

    // JSON Storage'dan demo çek
    let demo;
    try {
      const [rows] = await dbPool.execute(`
        SELECT 
          id, title, description, category, price, demo_url, is_active,
          created_at, updated_at, images, features, technologies
        FROM demos 
        WHERE id = ? 
        LIMIT 1
      `, [id])
      
      if (Array.isArray(rows) && rows.length > 0) {
        demo = rows[0] as any
        console.log('✅ Demo loaded from JSON Storage:', demo?.title || 'Not found');
      }
    } catch (error) {
      console.error('❌ JSON Storage error, using mock data:', error)
      // JSON Storage hata verirse mock data kullan
      demo = mockDemos.find(d => d.id === id)
    }
    
    // Eğer MySQL'den veri gelmediyse mock data kullan
    if (!demo) {
      console.log('📝 Using mock demo data for:', id);
      demo = mockDemos.find(d => d.id === id)
    }

    if (demo) {
      // FAST JSON PARSE (try-catch her biri için)
      const parseJSON = (data: any, fallback: any = []) => {
        if (!data) return fallback
        if (typeof data !== 'string') return data
        try {
          return JSON.parse(data)
        } catch {
          return fallback
        }
      }
      
      demo.images = parseJSON(demo.images, [])
      demo.features = parseJSON(demo.features, [])
      demo.technologies = parseJSON(demo.technologies, [])
      
      // Cache'e kaydet (5 dakika) - with size limit
      singleDemoCache.set(id, { data: demo, timestamp: now })
      
      // Memory cleanup - remove oldest entries if exceeds limit
      if (singleDemoCache.size > MAX_CACHE_ENTRIES) {
        const entries = Array.from(singleDemoCache.entries())
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
        const toDelete = entries.slice(0, Math.ceil(MAX_CACHE_ENTRIES / 2))
        toDelete.forEach(([key]) => singleDemoCache.delete(key))
      }
      
      return NextResponse.json(
        { demo },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache': 'MISS'
          },
        }
      )
    }

    return NextResponse.json({ error: "Demo bulunamadı" }, { status: 404 })
  } catch (error) {
    console.error("Error fetching demo:", error)
    return NextResponse.json({ error: "Demo yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Base64 resimleri kontrol et (hata vermemesi için)
    const images = body.images || []
    const cleanedImages = images.map((img: string) => {
      // Eğer base64 ise (data: ile başlıyorsa), uyarı ver
      if (img.startsWith('data:')) {
        console.warn('⚠️ Base64 resim tespit edildi, lütfen resim yükleme API\'sini kullanın')
        return '/placeholder.svg'
      }
      return img
    })

    // JSON alanlarını string'e çevir
    const imagesJson = JSON.stringify(cleanedImages)
    const featuresJson = JSON.stringify(body.features || [])
    const technologiesJson = JSON.stringify(body.technologies || [])
    
    // Paket boyutu kontrolü (max 16MB)
    const totalSize = imagesJson.length + featuresJson.length + technologiesJson.length
    if (totalSize > 16 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "Veri çok büyük. Lütfen daha az resim kullanın veya resimleri küçültün." 
      }, { status: 413 })
    }

    await dbPool.execute(`
      UPDATE demos
      SET title = ?, description = ?, category = ?, price = ?,
          images = ?, features = ?, technologies = ?,
          demo_url = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      body.title,
      body.description,
      body.category,
      body.price,
      imagesJson,
      featuresJson,
      technologiesJson,
      body.demo_url || null,
      body.is_active !== undefined ? body.is_active : true,
      id
    ])

    // Güncellenmiş veriyi getir
    const [rows] = await dbPool.execute(`
      SELECT * FROM demos WHERE id = ?
    `, [id])

    if (Array.isArray(rows) && rows.length > 0) {
      const demo = rows[0] as any
      
      // JSON parse
      if (typeof demo.images === 'string') demo.images = JSON.parse(demo.images)
      if (typeof demo.features === 'string') demo.features = JSON.parse(demo.features)
      if (typeof demo.technologies === 'string') demo.technologies = JSON.parse(demo.technologies)
      
      // Cache'i temizle
      singleDemoCache.delete(id)
      
      return NextResponse.json({ demo })
    }

    return NextResponse.json({ error: "Demo güncellenemedi" }, { status: 500 })
  } catch (error) {
    console.error("Error updating demo:", error)
    return NextResponse.json({ error: "Demo güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await dbPool.execute(`
      DELETE FROM demos WHERE id = ?
    `, [id])

    // Cache'i temizle
    singleDemoCache.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting demo:", error)
    return NextResponse.json({ error: "Demo silinirken hata oluştu" }, { status: 500 })
  }
}
