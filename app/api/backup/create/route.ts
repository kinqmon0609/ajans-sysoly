import { NextRequest, NextResponse } from "next/server";

import { backupDatabase } from "@/lib/backup/database";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkisi gereklidir" },
        { status: 403 }
      );
    }

    // Create backup
    const result = await backupDatabase();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Veritabanı yedeği oluşturuldu",
        filename: result.filename
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Yedekleme başarısız oldu" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Yedekleme sırasında hata oluştu" },
      { status: 500 }
    );
  }
}

