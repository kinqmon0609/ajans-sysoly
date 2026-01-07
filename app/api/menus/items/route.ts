import { type NextRequest, NextResponse } from "next/server"

import dbPool from "@/lib/mysql/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const menuId = searchParams.get("menuId")
    
    if (!menuId) {
      return NextResponse.json({ error: "Menu ID is required" }, { status: 400 })
    }

    const pool = dbPool;
    const result = await pool.execute(`
      SELECT 
        mi.*,
        p.slug as page_slug
      FROM menu_items mi
      LEFT JOIN pages p ON mi.page_id = p.id
      WHERE mi.menu_id = ?
      ORDER BY mi.display_order ASC
    `, [menuId])

    // JSON Storage'dan gelen veri formatını handle et
    const rows = Array.isArray(result) ? result[0] : result
    console.log('🔍 Menu items from database:', rows)
    
    // JSON serialization için verileri temizle
    const cleanRows = Array.isArray(rows) ? rows.map((item: any) => ({
      ...item,
      is_active: Boolean(item.is_active)
    })) : []
    return NextResponse.json(cleanRows)
  } catch (error) {
    console.error("Menu items fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const pool = dbPool;
    const id = crypto.randomUUID()

    await pool.execute(`
      INSERT INTO menu_items (id, menu_id, page_id, label, url, parent_id, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      body.menu_id,
      body.page_id || null,
      body.label,
      body.url || null,
      body.parent_id || null,
      body.display_order || 0,
      body.is_active ?? true
    ])

    const [rows] = await pool.execute('SELECT * FROM menu_items WHERE id = ?', [id])
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Menu item creation error:", error)
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Menu item ID is required" }, { status: 400 })
    }

    const body = await request.json()
    console.log('🔍 PUT request body:', body)
    console.log('🔍 Menu item ID to update:', id)
    
    const pool = dbPool;

    // Parent ID'nin geçerli olup olmadığını kontrol et
    if (body.parent_id) {
      const [parentCheck] = await pool.execute('SELECT id FROM menu_items WHERE id = ?', [body.parent_id])
      if (parentCheck.length === 0) {
        console.error('❌ Invalid parent_id:', body.parent_id)
        return NextResponse.json({ error: "Invalid parent_id" }, { status: 400 })
      }
    }

    await pool.execute(`
      UPDATE menu_items 
      SET page_id = ?, label = ?, url = ?, parent_id = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `, [
      body.page_id || null,
      body.label,
      body.url || null,
      body.parent_id || null,
      body.display_order || 0,
      body.is_active ?? true,
      id
    ])

    const [rows] = await pool.execute('SELECT * FROM menu_items WHERE id = ?', [id])
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Menu item update error:", error)
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Menu item ID is required" }, { status: 400 })
    }

    const pool = dbPool;
    await pool.execute('DELETE FROM menu_items WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Menu item deletion error:", error)
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
  }
}
