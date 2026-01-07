import { type NextRequest, NextResponse } from "next/server"

import { verifyToken } from "@/lib/auth/jwt"
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

    // 2FA kaydını sil
    await pool.execute(
      "DELETE FROM two_factor_secrets WHERE user_id = ?",
      [decoded.userId]
    )

    return NextResponse.json({
      success: true,
      message: "2FA devre dışı bırakıldı"
    })
  } catch (error) {
    console.error("2FA disable error:", error)
    return NextResponse.json(
      { error: "İşlem başarısız" },
      { status: 500 }
    )
  }
}

