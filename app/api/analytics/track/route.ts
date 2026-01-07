import { type NextRequest, NextResponse } from "next/server"

import pool from "@/lib/mysql/client"

export async function POST(request: NextRequest) {
  try {
    // Güvenli JSON parse - boş veya hatalı body kontrolü
    let body
    try {
      const text = await request.text()
      
      // Boş body kontrolü
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: 'Empty request body' },
          { status: 400 }
        )
      }
      
      body = JSON.parse(text)
      
      // Body validasyonu
      if (!body || typeof body !== 'object') {
        return NextResponse.json(
          { error: 'Invalid JSON body' },
          { status: 400 }
        )
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }
    
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    // Sayfa görüntüleme kaydet
    await pool.execute(`
      INSERT INTO page_views (
        page_slug, page_title, page_type, demo_id, 
        visitor_ip, visitor_id, user_agent, referrer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.slug || '',
      body.title || '',
      body.type || 'other',
      body.demoId || null,
      ip,
      body.visitorId,
      userAgent,
      body.referrer || null
    ])

    // Aktif ziyaretçi güncelle
    await pool.execute(`
      INSERT INTO active_visitors (visitor_id, current_page, visitor_ip, user_agent, last_seen)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        current_page = VALUES(current_page),
        visitor_ip = VALUES(visitor_ip),
        user_agent = VALUES(user_agent),
        last_seen = VALUES(last_seen)
    `, [body.visitorId, body.slug || '', ip, userAgent])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json({ error: "Failed to track" }, { status: 500 })
  }
}


