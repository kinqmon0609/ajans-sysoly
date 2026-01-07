import { type NextRequest, NextResponse } from "next/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import pool from "@/lib/mysql/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [rows] = await pool.execute('SELECT * FROM menus WHERE id = ?', [id])

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Menu fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    await pool.execute(`
      UPDATE menus 
      SET name = ?, slug = ?, description = ?, is_active = ?, display_order = ?
      WHERE id = ?
    `, [
      body.name,
      body.slug,
      body.description || null,
      body.is_active ?? true,
      body.display_order ?? 0,
      id
    ])

    const [rows] = await pool.execute('SELECT * FROM menus WHERE id = ?', [id])
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Menu update error:", error)
    return NextResponse.json({ error: "Failed to update menu" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await pool.execute('DELETE FROM menus WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Menu delete error:", error)
    return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 })
  }
}

