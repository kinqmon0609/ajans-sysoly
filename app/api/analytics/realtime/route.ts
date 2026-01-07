import { NextResponse } from "next/server"

import pool from "@/lib/mysql/client"

export async function GET() {
  try {
    // Son 5 dakikada aktif olan ziyaretçiler ve hangi sayfada oldukları
    const [visitors] = await pool.execute(`
      SELECT 
        visitor_id,
        current_page,
        visitor_ip,
        last_seen,
        TIMESTAMPDIFF(SECOND, last_seen, NOW()) as seconds_ago
      FROM active_visitors
      WHERE last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY last_seen DESC
    `)

    // Sayfa başına ziyaretçi sayısı
    const [pageStats] = await pool.execute(`
      SELECT 
        current_page,
        COUNT(*) as visitor_count
      FROM active_visitors
      WHERE last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      GROUP BY current_page
      ORDER BY visitor_count DESC
    `)

    return NextResponse.json({
      visitors,
      pageStats,
      totalActive: (visitors as any[]).length
    })
  } catch (error) {
    console.error("Realtime visitors fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch realtime visitors" }, { status: 500 })
  }
}


