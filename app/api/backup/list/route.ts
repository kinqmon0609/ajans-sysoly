import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/mysql/client";
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

    const [rows] = await pool.execute(`
      SELECT b.*, u.username as created_by_username
      FROM database_backups b
      LEFT JOIN users u ON b.created_by = u.id
      ORDER BY b.created_at DESC
      LIMIT 50
    `);

    return NextResponse.json({ backups: rows });

  } catch (error) {
    console.error("Get backups error:", error);
    return NextResponse.json({ error: "Yedekler yüklenemedi" }, { status: 500 });
  }
}

