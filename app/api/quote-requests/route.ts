import { type NextRequest, NextResponse } from "next/server"

import pool from "@/lib/mysql/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    let query = "SELECT * FROM quote_requests ORDER BY created_at DESC"
    const params: any[] = []

    if (status && status !== 'all') {
      query = "SELECT * FROM quote_requests WHERE status = ? ORDER BY created_at DESC"
      params.push(status)
    }

    const [requests] = await pool.execute(query, params)
    return NextResponse.json(requests)
  } catch (error) {
    console.error("Quote requests fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch quote requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const [result] = await pool.execute(`
      INSERT INTO quote_requests (
        company_name, contact_name, email, phone, service_type, 
        project_details, budget_range, timeline, additional_info, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
    `, [
      body.company_name || null,
      body.contact_name,
      body.email,
      body.phone || null,
      body.service_type,
      body.project_details || null,
      body.budget_range || null,
      body.timeline || null,
      body.additional_info || null
    ])

    const insertId = (result as any).insertId
    const [rows] = await pool.execute('SELECT * FROM quote_requests WHERE id = ?', [insertId])
    const quoteRequest = (rows as any)[0]

    // Bildirim oluştur
    try {
      await pool.execute(`
        INSERT INTO notifications (id, type, title, message, link, is_read)
        VALUES (UUID(), 'new_quote', 'Yeni Teklif Talebi', ?, '/admin/quote-requests', false)
      `, [`${body.contact_name} adlı kullanıcıdan yeni bir teklif talebi aldınız. Hizmet: ${body.service_type}`])
    } catch (notifError) {
      console.error("Notification creation error:", notifError)
      // Bildirim hatası ana işlemi etkilemesin
    }

    return NextResponse.json(quoteRequest)
  } catch (error) {
    console.error("Quote request creation error:", error)
    return NextResponse.json({ error: "Failed to create quote request" }, { status: 500 })
  }
}

