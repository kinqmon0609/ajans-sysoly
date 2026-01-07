import { type NextRequest, NextResponse } from "next/server"

import { verifyToken } from "@/lib/auth/jwt"
import { generate2FASecret, generate2FAQRCode } from "@/lib/auth/two-factor"
import { pool } from "@/lib/mysql/client"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 })
    }

    // Kullanıcı bilgilerini al
    const [users]: any = await pool.execute(
      "SELECT email, username FROM users WHERE id = ?",
      [decoded.userId]
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
    }

    const user = users[0]
    const identifier = user.email || user.username

    // 2FA secret oluştur
    const secret = generate2FASecret(identifier)
    const qrCode = await generate2FAQRCode(secret, identifier)

    // Secret'ı veritabanına kaydet (henüz doğrulanmamış)
    await pool.execute(
      `INSERT INTO two_factor_secrets (user_id, secret, is_verified) 
       VALUES (?, ?, FALSE) 
       ON DUPLICATE KEY UPDATE secret = ?, is_verified = FALSE`,
      [decoded.userId, secret.base32, secret.base32]
    )

    return NextResponse.json({
      secret: secret.base32,
      qrCode
    })
  } catch (error) {
    console.error("2FA setup error:", error)
    return NextResponse.json(
      { error: "2FA kurulumu başarısız" },
      { status: 500 }
    )
  }
}

