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

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = `
      SELECT sl.*, u.username, u.email
      FROM security_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];

    if (severity && ['info', 'warning', 'critical'].includes(severity)) {
      sql += ' AND sl.severity = ?';
      params.push(severity);
    }

    sql += ' ORDER BY sl.created_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.execute(sql, params);

    return NextResponse.json({ logs: rows });

  } catch (error) {
    console.error("Get security logs error:", error);
    return NextResponse.json({ error: "Loglar yüklenemedi" }, { status: 500 });
  }
}

