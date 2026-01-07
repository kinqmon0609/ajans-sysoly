import { type NextRequest, NextResponse } from "next/server"

import pool from "@/lib/mysql/client"
import { createContact } from "@/lib/mysql/queries"

export async function POST(request: NextRequest) {
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

    return NextResponse.json({ message: contact })
  } catch (error) {
    console.error("Mesaj gönderme hatası:", error)
    return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 500 })
  }
}
