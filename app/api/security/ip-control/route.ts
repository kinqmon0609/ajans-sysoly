import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/mysql/client";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const [rows] = await pool.execute(`
      SELECT * FROM ip_access_control ORDER BY created_at DESC
    `);

    return NextResponse.json({ ipRules: rows });

  } catch (error) {
    console.error("Get IP control error:", error);
    return NextResponse.json({ error: "IP kuralları yüklenemedi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { ip_address, type, reason } = body;

    if (!ip_address || !type || !['whitelist', 'blacklist'].includes(type)) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    await pool.execute(`
      INSERT INTO ip_access_control (id, ip_address, type, reason, created_by)
      VALUES (UUID(), ?, ?, ?, ?)
    `, [ip_address, type, reason || null, payload.userId]);

    return NextResponse.json({ success: true, message: "IP kuralı eklendi" });

  } catch (error) {
    console.error("Add IP rule error:", error);
    return NextResponse.json({ error: "IP kuralı eklenemedi" }, { status: 500 });
  }
}

