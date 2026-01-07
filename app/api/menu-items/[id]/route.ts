import { type NextRequest, NextResponse } from "next/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import pool from "@/lib/mysql/client"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    await pool.execute(`
      UPDATE menu_items 
      SET menu_id = ?, page_id = ?, label = ?, url = ?, parent_id = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `, [
      body.menu_id,
      body.page_id || null,
      body.label,
      body.url || null,
      body.parent_id || null,
      body.display_order ?? 0,
      body.is_active ?? true,
      id
    ])

    const [rows] = await pool.execute(`
      SELECT mi.*, p.title as page_title, p.slug as page_slug
      FROM menu_items mi
      LEFT JOIN pages p ON mi.page_id = p.id
      WHERE mi.id = ?
    `, [id])

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Menu item update error:", error)
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await pool.execute('DELETE FROM menu_items WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Menu item delete error:", error)
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
  }
}

