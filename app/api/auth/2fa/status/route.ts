import { type NextRequest, NextResponse } from "next/server"

import { verifyToken } from "@/lib/auth/jwt"
import { pool } from "@/lib/mysql/client"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 })
    }

    // Kullanıcının 2FA durumunu kontrol et
    const [rows]: any = await pool.execute(
      "SELECT id FROM two_factor_secrets WHERE user_id = ? AND is_verified = TRUE",
      [decoded.userId]
    )

    return NextResponse.json({
      enabled: rows.length > 0
    })
  } catch (error) {
    console.error("2FA status check error:", error)
    return NextResponse.json(
      { error: "Durum kontrolü başarısız" },
      { status: 500 }
    )
  }
}

