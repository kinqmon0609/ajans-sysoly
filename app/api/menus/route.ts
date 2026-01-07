import { type NextRequest, NextResponse } from "next/server"

import dbPool from "@/lib/mysql/client"

// Cache for menus
const menusCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

// Gerçek verilerden menü items - Header component için düzenlendi
const mockMenus = [
  { id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', name: 'Ana Menü', slug: 'main-menu', description: 'Site header menüsü', is_active: 1, display_order: 1, created_at: '2025-10-11 20:10:49', updated_at: '2025-10-11 20:10:49' }
];

// Menu items - Header component için
const mockMenuItems = [
  { id: '65a650a6-e938-4d8b-ade5-7d65ba2e3476', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: '2dbb3d1c-a6d9-11f0-af23-eb6435dcb1e1', label: 'Hakkımızda', url: null, parent_id: null, display_order: 0, is_active: true, page_slug: 'hakkimizda' },
  { id: '6aaf2452-10c9-4f41-bb06-d19d91fe843e', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: '1c6f7298-a6b2-11f0-af23-eb6435dcb1e1', label: 'Hizmetlerimiz', url: null, parent_id: null, display_order: 1, is_active: true, page_slug: 'hizmetlerimiz' },
  { id: '6d2c0f58-bd2e-4ea3-b974-ed1c7c952b82', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: null, label: 'Yazılımlarımız', url: '/demolarimiz', parent_id: null, display_order: 2, is_active: true },
  { id: 'abae90a8-a714-11f0-b978-7df75ef09a30', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: '8a388e24-a714-11f0-b978-7df75ef09a30', label: 'Paketlerimiz', url: null, parent_id: null, display_order: 3, is_active: true, page_slug: 'paketlerimiz' },
  { id: '2597b697-ad3a-4a87-b72e-0dc23b7a1f61', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: null, label: 'Blog', url: '/blog', parent_id: null, display_order: 4, is_active: true },
  { id: '52559400-b74b-4253-970a-37820b034e88', menu_id: '617d6580-a6de-11f0-af23-eb6435dcb1e1', page_id: '603431d6-a6d9-11f0-af23-eb6435dcb1e1', label: 'İletişim', url: null, parent_id: null, display_order: 5, is_active: true, page_slug: 'iletisim' }
];

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Menus API çağrıldı")
    
    // Önce gerçek veritabanını dene
    const pool = dbPool
    const [rows] = await pool.execute(`
      SELECT * FROM menus 
      WHERE is_active = true 
      ORDER BY display_order ASC
    `)
    
    console.log("✅ Menus veritabanından alındı:", (rows as any).length)
    return NextResponse.json(rows)
    
  } catch (error) {
    console.error("❌ Menus fetch error:", error)
    console.log("🔄 Mock data kullanılıyor")
    // Hata durumunda mock data döndür
    return NextResponse.json(mockMenus)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const pool = dbPool;
    const id = 'menu-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)

    await pool.execute(`
      INSERT INTO menus (id, name, slug, description, is_active, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      id,
      body.name,
      body.slug,
      body.description || null,
      body.is_active ?? true,
      body.display_order ?? 0
    ])

    const [rows] = await pool.execute('SELECT * FROM menus WHERE id = ?', [id])

    // Cache'i temizle (yeni menu eklendi)
    menusCache.clear()

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Menu creation error:", error)
    
    // Duplicate slug hatası için özel mesaj
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage?.includes('slug')) {
      return NextResponse.json({ 
        error: "Bu slug zaten kullanılıyor. Lütfen farklı bir slug deneyin." 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Menu ID is required" }, { status: 400 })
    }

    const pool = dbPool;
    
    // Önce menu items'ları sil
    await pool.execute('DELETE FROM menu_items WHERE menu_id = ?', [id])
    
    // Sonra menüyü sil
    await pool.execute('DELETE FROM menus WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Menu deletion error:", error)
    return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 })
  }
}

