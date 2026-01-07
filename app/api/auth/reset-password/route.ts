import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/mysql/client";
import { hashPassword } from "@/lib/auth/password";
import { updateUser } from "@/lib/mysql/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: "Token ve şifre gereklidir" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Şifre en az 8 karakter olmalıdır" }, { status: 400 });
    }

    // Token'ı kontrol et
    const [users] = await pool.execute(`
      SELECT * FROM users 
      WHERE password_reset_token = ? 
        AND password_reset_expires > NOW()
    `, [token]);

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş token" }, { status: 400 });
    }

    const user: any = users[0];

    // Yeni şifreyi hashle
    const password_hash = await hashPassword(password);

    // Şifreyi güncelle ve token'ı temizle
    await updateUser(user.id, {
      password_hash,
      password_reset_token: null,
      password_reset_expires: null
    });

    return NextResponse.json({
      success: true,
      message: "Şifreniz başarıyla değiştirildi"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Şifre sıfırlama başarısız" }, { status: 500 });
  }
}

