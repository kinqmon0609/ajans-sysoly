import { NextRequest, NextResponse } from "next/server";

import { getAllUsers, createUser } from "@/lib/mysql/queries";
import { hashPassword } from "@/lib/auth/password";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const users = await getAllUsers();
    return NextResponse.json({ users });

  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Kullanıcılar yüklenemedi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const body = await request.json();
    const { username, email, password, full_name, role } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 });
    }

    const password_hash = await hashPassword(password);

    await createUser({
      username,
      email,
      password_hash,
      full_name,
      role: role || 'viewer'
    });

    return NextResponse.json({ success: true, message: "Kullanıcı oluşturuldu" });

  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Kullanıcı oluşturulamadı" }, { status: 500 });
  }
}

