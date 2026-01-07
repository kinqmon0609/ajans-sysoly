import { type NextRequest, NextResponse } from "next/server"

import { verifyToken } from "@/lib/auth/jwt"
import { verify2FAToken } from "@/lib/auth/two-factor"
import { pool } from "@/lib/mysql/client"

export async function POST(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!authToken) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const decoded = verifyToken(authToken)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "Doğrulama kodu gerekli" }, { status: 400 })
    }

    // Kullanıcının secret'ını al
    const [rows]: any = await pool.execute(
      "SELECT secret FROM two_factor_secrets WHERE user_id = ?",
      [decoded.userId]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "2FA kurulumu bulunamadı" }, { status: 404 })
    }

    const secret = rows[0].secret

    // Token'ı doğrula
    const isValid = verify2FAToken(token, secret)

    if (!isValid) {
      return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 })
    }

    // Secret'ı doğrulanmış olarak işaretle
    await pool.execute(
      "UPDATE two_factor_secrets SET is_verified = TRUE WHERE user_id = ?",
      [decoded.userId]
    )

    return NextResponse.json({
      success: true,
      message: "2FA başarıyla aktifleştirildi"
    })
  } catch (error) {
    console.error("2FA verify error:", error)
    return NextResponse.json(
      { error: "Doğrulama başarısız" },
      { status: 500 }
    )
  }
}

