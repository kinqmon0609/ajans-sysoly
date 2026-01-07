import { type NextRequest, NextResponse } from "next/server"

import pool from "@/lib/mysql/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "30")

    // 1. En çok görüntülenen sayfalar
    let topPages: any[] = []
    try {
      const [pages] = await pool.execute(`
        SELECT 
          page_slug,
          page_title,
          COUNT(*) as views,
          COUNT(DISTINCT visitor_id) as unique_visitors
        FROM page_views
        WHERE page_type = 'page' 
          AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY page_slug, page_title
        ORDER BY views DESC
        LIMIT 10
      `, [days])
      topPages = pages as any[]
    } catch (error) {
      console.error("Error fetching top pages:", error)
    }

    // 2. En çok görüntülenen demolar
    let topDemos: any[] = []
    try {
      const [demos] = await pool.execute(`
        SELECT 
          d.id,
          d.title,
          COUNT(pv.id) as views,
          COUNT(DISTINCT pv.visitor_id) as unique_visitors
        FROM demos d
        LEFT JOIN page_views pv ON d.id = pv.demo_id AND pv.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        WHERE pv.id IS NOT NULL
        GROUP BY d.id, d.title
        ORDER BY views DESC
        LIMIT 10
      `, [days])
      topDemos = demos as any[]
    } catch (error) {
      console.error("Error fetching top demos:", error)
    }

    // 3. En çok talep edilen hizmetler (teklif formundan)
    let topServices: any[] = []
    try {
      const [services] = await pool.execute(`
        SELECT 
          service_type,
          COUNT(*) as count
        FROM quote_requests
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY service_type
        ORDER BY count DESC
      `, [days])
      topServices = services as any[]
    } catch (error) {
      console.error("Error fetching top services:", error)
    }

    // 4. Genel istatistikler
    let stats = {
      total_views: 0,
      unique_visitors: 0,
      total_quotes: 0,
      total_contacts: 0
    }
    try {
      const [totalStats] = await pool.execute(`
        SELECT 
          (SELECT COUNT(*) FROM page_views WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) as total_views,
          (SELECT COUNT(DISTINCT visitor_id) FROM page_views WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) as unique_visitors,
          (SELECT COUNT(*) FROM quote_requests WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) as total_quotes,
          (SELECT COUNT(*) FROM contacts WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) as total_contacts
      `, [days, days, days, days])
      stats = (totalStats as any)[0] || stats
    } catch (error) {
      console.error("Error fetching total stats:", error)
    }

    // 5. Günlük görüntüleme grafiği için veri
    let dailyViews: any[] = []
    try {
      const [views] = await pool.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as views,
          COUNT(DISTINCT visitor_id) as unique_visitors
        FROM page_views
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [days])
      dailyViews = views as any[]
    } catch (error) {
      console.error("Error fetching daily views:", error)
    }

    return NextResponse.json({
      topPages,
      topDemos,
      topServices,
      stats,
      dailyViews
    })
  } catch (error) {
    console.error("Analytics reports error:", error)
    return NextResponse.json({ 
      error: "Failed to generate reports",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

