import { getCategories, createCategory } from "@/lib/mysql/queries"

import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Mock categories data - SQL dosyasından
const mockCategories = [
  { id: '11a3fcda-a6b2-11f0-af23-eb6435dcb1e1', name: 'Web Sitesi', slug: 'web-sitesi', description: 'Kurumsal ve e-ticaret web siteleri', icon: '🌐', color: '#3B82F6', is_active: 1, sort_order: 1, created_at: '2025-10-11 14:53:48', updated_at: '2025-10-11 14:53:48' },
  { id: '11a419b8-a6b2-11f0-af23-eb6435dcb1e1', name: 'Mobil Uygulama', slug: 'mobil-uygulama', description: 'iOS ve Android mobil uygulamalar', icon: '📱', color: '#10B981', is_active: 1, sort_order: 2, created_at: '2025-10-11 14:53:48', updated_at: '2025-10-11 14:53:48' },
  { id: '11a41b20-a6b2-11f0-af23-eb6435dcb1e1', name: 'Özel Yazılım', slug: 'ozel-yazilim', description: 'İşletmelere özel yazılım çözümleri', icon: '⚙️', color: '#8B5CF6', is_active: 1, sort_order: 3, created_at: '2025-10-11 14:53:48', updated_at: '2025-10-11 14:53:48' },
  { id: '11a425f2-a6b2-11f0-af23-eb6435dcb1e1', name: 'E-ticaret', slug: 'e-ticaret', description: 'Online satış platformları', icon: '🛒', color: '#F59E0B', is_active: 1, sort_order: 4, created_at: '2025-10-11 14:53:48', updated_at: '2025-10-11 14:53:48' },
  { id: '11a42854-a6b2-11f0-af23-eb6435dcb1e1', name: 'Dashboard', slug: 'dashboard', description: 'Yönetim panelleri ve analitik araçlar', icon: '📊', color: '#EF4444', is_active: 1, sort_order: 5, created_at: '2025-10-11 14:53:48', updated_at: '2025-10-11 14:53:48' },
  { id: '11a42a08-a6b2-11f0-af23-eb6435dcb1e1', name: 'Kurumsal', slug: 'kurumsal', description: 'Kurumsal web siteleri ve çözümler', icon: '🏢', color: '#6366F1', is_active: 1, sort_order: 6, created_at: '2025-10-11 14:53:48', updated_at: '2025-10-11 14:53:48' }
];

// Cache optimizasyonu
let categoriesCache: { data: any; timestamp: number } | null = null
const CACHE_DURATION = 30 * 60 * 1000 // 30 dakika (kategoriler nadiren değişir)

export async function GET() {
  try {
    const now = Date.now()
    
    // Cache kontrolü - geçici olarak devre dışı
    // if (categoriesCache && now - categoriesCache.timestamp < CACHE_DURATION) {
    //   return NextResponse.json(
    //     categoriesCache.data || [],
    //     {
    //       headers: {
    //         'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    //         'X-Cache': 'HIT'
    //       }
    //     }
    //   )
    // }

    // MySQL'den categories çek
    let categories;
    try {
      categories = await getCategories();
      console.log('✅ Categories loaded from MySQL:', categories?.length || 0);
    } catch (error) {
      console.error('❌ MySQL error, using mock data:', error);
      // MySQL hata verirse mock data kullan
      categories = mockCategories;
    }
    
    // Eğer MySQL'den veri gelmediyse mock data kullan
    if (!categories || categories.length === 0) {
      console.log('📝 Using mock categories data');
      categories = mockCategories;
    }
    
    // Cache'e kaydet
    categoriesCache = { data: categories, timestamp: now }
    
    return NextResponse.json(
      categories || [],
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'X-Cache': 'MISS'
        }
      }
    )
  } catch (error) {
    console.error("Error fetching categories:", error)
    // Return empty array instead of error to prevent app crash
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Slug oluştur
    const slug = body.name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    // MySQL'e kategori ekle
    try {
      console.log('🔵 POST /api/categories - Attempting to create category:', body.name);
      const result = await createCategory({
        name: body.name,
        slug: slug,
        description: body.description || null,
        icon: body.icon || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
        sort_order: body.sort_order || 0
      });

      // Cache'i temizle
      categoriesCache = null

      // Yeni kategoriyi döndür
      const newCategory = {
        id: (result as any).insertId || Date.now().toString(),
        name: body.name,
        slug: slug,
        description: body.description || null,
        icon: body.icon || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
        sort_order: body.sort_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('✅ Category created successfully, returning:', newCategory);
      return NextResponse.json(newCategory)
    } catch (dbError) {
      console.error("❌ Database error creating category:", dbError)
      
      // Database hatası durumunda mock data döndür
      const newCategory = {
        id: Date.now().toString(),
        name: body.name,
        slug: slug,
        description: body.description || null,
        icon: body.icon || null,
        color: body.color || '#3B82F6',
        is_active: body.is_active !== undefined ? body.is_active : true,
        sort_order: body.sort_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Cache'i temizle
      categoriesCache = null

      return NextResponse.json(newCategory)
    }
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
