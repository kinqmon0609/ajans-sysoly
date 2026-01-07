import { NextRequest, NextResponse } from "next/server";

import { getNewsletterSubscribers } from "@/lib/mysql/queries";
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

    if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const subscribers = await getNewsletterSubscribers(activeOnly);

    return NextResponse.json({ subscribers });

  } catch (error) {
    console.error("Get subscribers error:", error);
    return NextResponse.json({ error: "Aboneler yüklenemedi" }, { status: 500 });
  }
}

