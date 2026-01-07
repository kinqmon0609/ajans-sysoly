import { NextResponse } from "next/server"
import dbPool from "@/lib/mysql/client"

// Mock demos data - SQL dosyasından gerçek veriler
const mockDemos = [
  {
    id: 1,
    title: "E-Ticaret Mağazası",
    description: "Modern ve kullanıcı dostu e-ticaret platformu. Ürün yönetimi, sepet, ödeme sistemi ve admin paneli ile eksiksiz online mağaza çözümü.",
    category: "E-ticaret",
    price: 15000,
    demo_url: "https://demo1.example.com",
    is_active: 1,
    created_at: "2025-10-11 14:53:48",
    updated_at: "2025-10-11 14:53:48",
    thumbnail: "/placeholder.jpg",
    shortDescription: "Modern ve kullanıcı dostu e-ticaret platformu..."
  },
  {
    id: 2,
    title: "Kurumsal Web Sitesi",
    description: "Profesyonel kurumsal web sitesi. Responsive tasarım, SEO optimizasyonu, iletişim formu ve admin paneli ile güçlü online varlık.",
    category: "Kurumsal",
    price: 8000,
    demo_url: "https://demo2.example.com",
    is_active: 1,
    created_at: "2025-10-11 14:53:48",
    updated_at: "2025-10-11 14:53:48",
    thumbnail: "/placeholder.jpg",
    shortDescription: "Profesyonel kurumsal web sitesi..."
  },
  {
    id: 3,
    title: "Restoran Sipariş Sistemi",
    description: "Online sipariş ve rezervasyon sistemi. Menü yönetimi, masa rezervasyonu, ödeme entegrasyonu ve mobil uyumlu tasarım.",
    category: "Özel Yazılım",
    price: 12000,
    demo_url: "https://demo3.example.com",
    is_active: 1,
    created_at: "2025-10-11 14:53:48",
    updated_at: "2025-10-11 14:53:48",
    thumbnail: "/placeholder.jpg",
    shortDescription: "Online sipariş ve rezervasyon sistemi..."
  },
  {
    id: 4,
    title: "Blog ve İçerik Yönetimi",
    description: "Modern blog platformu. İçerik yönetimi, kategori sistemi, yorum sistemi ve SEO optimizasyonu ile güçlü içerik platformu.",
    category: "Web Sitesi",
    price: 6000,
    demo_url: "https://demo4.example.com",
    is_active: 1,
    created_at: "2025-10-11 14:53:48",
    updated_at: "2025-10-11 14:53:48",
    thumbnail: "/placeholder.jpg",
    shortDescription: "Modern blog platformu..."
  },
  {
    id: 5,
    title: "Mobil Uygulama",
    description: "iOS ve Android uygulaması. Native performans, push notification, offline çalışma ve modern UI/UX tasarımı.",
    category: "Mobil Uygulama",
    price: 25000,
    demo_url: "https://demo5.example.com",
    is_active: 1,
    created_at: "2025-10-11 14:53:48",
    updated_at: "2025-10-11 14:53:48",
    thumbnail: "/placeholder.jpg",
    shortDescription: "iOS ve Android uygulaması..."
  },
  {
    id: 6,
    title: "Dashboard ve Analitik",
    description: "İş zekası dashboard'u. Veri görselleştirme, raporlama, grafik analizleri ve gerçek zamanlı veri takibi.",
    category: "Dashboard",
    price: 18000,
    demo_url: "https://demo6.example.com",
    is_active: 1,
    created_at: "2025-10-11 14:53:48",
    updated_at: "2025-10-11 14:53:48",
    thumbnail: "/placeholder.jpg",
    shortDescription: "İş zekası dashboard'u..."
  }
];

// In-memory cache (pagination aware) - OPTIMIZED
const demosCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika
const MAX_CACHE_ENTRIES = 100 // Limit cache size

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const includeInactive = searchParams.get("includeInactive") === "true"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Cache key (pagination aware)
    const cacheKey = `${includeInactive ? 'admin' : 'public'}-${page}-${limit}-${category || 'all'}`
    const now = Date.now()
    const cached = demosCache.get(cacheKey)
    
    let demos: any[]
    let total = 0
    
    // JSON Storage'dan demos çek
    try {
      const [rows] = await dbPool.execute(`
        SELECT * FROM demos 
        ${includeInactive ? '' : 'WHERE is_active = 1'}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `)
      
      const [countRows] = await dbPool.execute(`
        SELECT COUNT(*) as total FROM demos 
        ${includeInactive ? '' : 'WHERE is_active = 1'}
      `)
      
      demos = rows as any[]
      total = (countRows as any[])[0]?.total || 0
      console.log('✅ Demos loaded from JSON Storage:', demos?.length || 0);
    } catch (error) {
      console.error('❌ JSON Storage error, using mock data:', error)
      // JSON Storage hata verirse mock data kullan
      demos = includeInactive ? mockDemos : mockDemos.filter(demo => demo.is_active)
      total = demos.length
    }
    
    // Eğer MySQL'den veri gelmediyse mock data kullan
    if (!demos || demos.length === 0) {
      console.log('📝 Using mock demos data');
      demos = includeInactive ? mockDemos : mockDemos.filter(demo => demo.is_active)
      total = demos.length
    }

    // Filter by category (client-side, hızlı)
    if (category && category !== "Tümü") {
      demos = demos.filter((demo: any) => demo.category === category)
    }

    // Filter by search (minimal data olduğu için hızlı)
    if (search) {
      demos = demos.filter((demo: any) => 
        demo.title.toLowerCase().includes(search.toLowerCase()) ||
        demo.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Pagination uygula
    const startIndex = offset
    const endIndex = startIndex + limit
    const paginatedDemos = demos.slice(startIndex, endIndex)

    return NextResponse.json(
      { 
        demos: paginatedDemos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + paginatedDemos.length < total
        }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error("Error fetching demos:", error)
    return NextResponse.json({ error: "Demolar yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Base64 resimleri kontrol et
    const images = body.images || []
    const cleanedImages = images.map((img: string) => {
      if (img.startsWith('data:')) {
        console.warn('⚠️ Base64 resim tespit edildi, lütfen resim yükleme API\'sini kullanın')
        return '/placeholder.svg'
      }
      return img
    })
    
    body.images = cleanedImages
    
    const [result] = await dbPool.execute(`
      INSERT INTO demos (title, description, category, price, demo_url, is_active, thumbnail, shortDescription)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.title,
      body.description, 
      body.category,
      body.price,
      body.demo_url,
      body.is_active || 1,
      body.thumbnail || '/placeholder.jpg',
      body.shortDescription || body.description?.substring(0, 100) + '...'
    ])
    
    const demo = { id: Date.now(), ...body }
    
    // Tüm cache'i temizle
    demosCache.clear()
    
    return NextResponse.json({ demo })
  } catch (error) {
    console.error("Error creating demo:", error)
    return NextResponse.json({ error: "Demo oluşturulurken hata oluştu" }, { status: 500 })
  }
}
