import { type NextRequest, NextResponse } from "next/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import pool from "@/lib/mysql/client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM quote_requests WHERE id = ?',
      [params.id]
    )

    const requests = rows as any[]
    if (requests.length === 0) {
      return NextResponse.json({ error: "Quote request not found" }, { status: 404 })
    }

    return NextResponse.json(requests[0])
  } catch (error) {
    console.error("Quote request fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch quote request" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    await pool.execute(`
      UPDATE quote_requests 
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `, [body.status, params.id])

    const [rows] = await pool.execute(
      'SELECT * FROM quote_requests WHERE id = ?',
      [params.id]
    )

    return NextResponse.json((rows as any)[0])
  } catch (error) {
    console.error("Quote request update error:", error)
    return NextResponse.json({ error: "Failed to update quote request" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await pool.execute('DELETE FROM quote_requests WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Quote request delete error:", error)
    return NextResponse.json({ error: "Failed to delete quote request" }, { status: 500 })
  }
}

