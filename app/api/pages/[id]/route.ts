import { type NextRequest, NextResponse } from "next/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import pool from "@/lib/mysql/client"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [rows] = await pool.execute(`
      SELECT * FROM pages WHERE id = ?
    `, [id])

    if (Array.isArray(rows) && rows.length > 0) {
      const page = rows[0] as any
      // JSON string'i parse et
      if (typeof page.content === 'string') {
        try {
          page.content = JSON.parse(page.content)
        } catch (error) {
          console.error('Error parsing page content:', error)
          page.content = { sections: [] }
        }
      }
      return NextResponse.json(page)
    }

    return NextResponse.json({ error: "Page not found" }, { status: 404 })
  } catch (error) {
    console.error("Page fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Content'i JSON string olarak kaydet
    const contentJson = JSON.stringify(body.content || { sections: [] })

    // undefined değerleri null'a çevir, boş string'leri koru
    const title = body.title !== undefined ? body.title : null
    const slug = body.slug !== undefined ? body.slug : null
    const description = body.description !== undefined ? body.description : null
    const metaTitle = body.meta_title !== undefined ? body.meta_title : null
    const metaDescription = body.meta_description !== undefined ? body.meta_description : null
    const metaKeywords = body.meta_keywords !== undefined ? body.meta_keywords : null
    const isActive = body.is_active !== undefined ? body.is_active : true
    const sortOrder = body.sort_order !== undefined ? body.sort_order : 0

    const [result] = await pool.execute(`
      UPDATE pages 
      SET title = ?, slug = ?, description = ?, content = ?, 
          meta_title = ?, meta_description = ?, meta_keywords = ?, 
          is_active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title,
      slug,
      description,
      contentJson,
      metaTitle,
      metaDescription,
      metaKeywords,
      isActive,
      sortOrder,
      id
    ])

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Page update error:", error)
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await pool.execute(`
      DELETE FROM pages WHERE id = ?
    `, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Page deletion error:", error)
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 })
  }
}
