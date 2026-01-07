import { NextResponse } from "next/server"

import dbPool from "@/lib/mysql/client"

// 🚀 Dashboard cache (5 dakika)
const dashboardCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

export async function GET() {
  try {
    // Cache kontrolü
    const cached = dashboardCache.get('dashboard')
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    // Tüm sorguları PARALEL çalıştır (3x daha hızlı!)
    const pool = dbPool;
    const [quotesResult, messagesResult, viewsResult] = await Promise.all([
      pool.execute(`
        SELECT 
          'quote' as type,
          CAST(id AS CHAR) as id,
          contact_name as title,
          service_type as description,
          created_at
        FROM quote_requests
        ORDER BY created_at DESC
        LIMIT 5
      `).catch(() => [[]]),
      
      pool.execute(`
        SELECT 
          'message' as type,
          CAST(id AS CHAR) as id,
          name as title,
          subject as description,
          created_at
        FROM contacts
        ORDER BY created_at DESC
        LIMIT 5
      `).catch(() => [[]]),
      
      pool.execute(`
        SELECT 
          'page_view' as type,
          CAST(id AS CHAR) as id,
          page_title as title,
          page_slug as description,
          created_at
        FROM page_views
        WHERE page_type = 'page'
        ORDER BY created_at DESC
        LIMIT 5
      `).catch(() => [[]])
    ])

    // Aktiviteleri birleştir
    let activities: any[] = [
      ...(quotesResult[0] as any[]),
      ...(messagesResult[0] as any[]),
      ...(viewsResult[0] as any[])
    ]

    // Tarihe göre sırala ve ilk 10'unu al
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    activities = activities.slice(0, 10)

    // İstatistikler
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM demos) as totalDemos,
        (SELECT COUNT(*) FROM page_views WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as totalViews,
        (SELECT COUNT(*) FROM contacts) as totalMessages,
        (SELECT COUNT(*) FROM contacts WHERE is_read = false) as unreadMessages,
        (SELECT COUNT(*) FROM quote_requests) as totalQuotes,
        (SELECT COUNT(*) FROM quote_requests WHERE status = 'new') as newQuotes,
        (SELECT COUNT(*) FROM appointments) as totalAppointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pendingAppointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'confirmed') as confirmedAppointments,
        (SELECT COUNT(*) FROM appointments WHERE DATE(appointment_date) = CURDATE()) as todayAppointments
    `)

    // Yaklaşan randevular (bugünden sonraki, onaylanmış veya bekleyen)
    let upcomingAppointments: any[] = []
    try {
      const [appointments] = await pool.execute(`
        SELECT 
          id,
          customer_name,
          customer_email,
          customer_phone,
          service_type,
          appointment_date,
          duration_minutes,
          status,
          notes
        FROM appointments
        WHERE appointment_date >= NOW()
          AND status IN ('pending', 'confirmed')
        ORDER BY appointment_date ASC
        LIMIT 5
      `)
      upcomingAppointments = appointments as any[]
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error)
    }

    const responseData = {
      activities: activities,
      stats: (stats as any)[0] || {},
      upcomingAppointments: upcomingAppointments
    }

    // Cache'e kaydet
    dashboardCache.set('dashboard', { data: responseData, timestamp: Date.now() })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Dashboard data fetch error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch dashboard data",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

