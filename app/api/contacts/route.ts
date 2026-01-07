import { NextResponse } from "next/server"

import { getContacts, createContact } from "@/lib/mysql/queries"
import pool from "@/lib/mysql/client"

export async function GET() {
  try {
    const contacts = await getContacts()
    return NextResponse.json({ contacts })
  } catch (error) {
    console.error("Error in GET /api/contacts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const contact = await createContact({ name, email, phone, subject, message })

    // Bildirim oluştur
    try {
      await pool.execute(`
        INSERT INTO notifications (id, type, title, message, link, is_read)
        VALUES (UUID(), 'new_message', 'Yeni İletişim Mesajı', ?, '/admin/messages', false)
      `, [`${name} adlı kullanıcıdan yeni bir iletişim mesajı aldınız. Konu: ${subject}`])
    } catch (notifError) {
      console.error("Notification creation error:", notifError)
      // Bildirim hatası ana işlemi etkilemesin
    }

    return NextResponse.json({ contact }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/contacts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
