import { type NextRequest, NextResponse } from "next/server"

import pool from "@/lib/mysql/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get("unread")

    let query = "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50"
    
    if (unreadOnly === "true") {
      query = "SELECT * FROM notifications WHERE is_read = false ORDER BY created_at DESC LIMIT 50"
    }

    const [notifications] = await pool.execute(query)
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Bildirimler yükleme hatası:", error)
    return NextResponse.json({ error: "Bildirimler yüklenemedi" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [result] = await pool.execute(`
      INSERT INTO notifications (id, type, title, message, link, is_read)
      VALUES (UUID(), ?, ?, ?, ?, ?)
    `, [
      body.type,
      body.title,
      body.message,
      body.link || null,
      body.is_read || false
    ])

    return NextResponse.json({ notification: { id: (result as any).insertId, ...body } })
  } catch (error) {
    console.error("Bildirim oluşturma hatası:", error)
    return NextResponse.json({ error: "Bildirim oluşturulamadı" }, { status: 500 })
  }
}
