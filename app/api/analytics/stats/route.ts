import { NextResponse } from "next/server"

import pool from "@/lib/mysql/client"

export async function GET() {
  try {
    // Toplam demo sayısı
    const [totalDemosResult] = await pool.execute("SELECT COUNT(*) as count FROM demos")
    const totalDemos = (totalDemosResult as any)[0]?.count || 0

    // Aktif demo sayısı
    const [activeDemosResult] = await pool.execute("SELECT COUNT(*) as count FROM demos WHERE is_active = true")
    const activeDemos = (activeDemosResult as any)[0]?.count || 0

    // Toplam görüntüleme sayısı
    const [totalViewsResult] = await pool.execute("SELECT COUNT(*) as count FROM demo_views")
    const totalViews = (totalViewsResult as any)[0]?.count || 0

    // Toplam mesaj sayısı
    const [totalMessagesResult] = await pool.execute("SELECT COUNT(*) as count FROM contacts")
    const totalMessages = (totalMessagesResult as any)[0]?.count || 0

    // Okunmamış mesaj sayısı
    const [unreadMessagesResult] = await pool.execute("SELECT COUNT(*) as count FROM contacts WHERE is_read = false")
    const unreadMessages = (unreadMessagesResult as any)[0]?.count || 0

    // Son 7 günün görüntüleme verileri
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [recentViewsResult] = await pool.execute(`
      SELECT viewed_at FROM demo_views 
      WHERE viewed_at >= ? 
      ORDER BY viewed_at ASC
    `, [sevenDaysAgo.toISOString()])

    // Günlük görüntüleme sayılarını hesapla
    const dailyViews = (recentViewsResult as any[]).reduce((acc: any, view: any) => {
      const date = new Date(view.viewed_at).toLocaleDateString("tr-TR")
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      totalDemos,
      activeDemos,
      totalViews,
      totalMessages,
      unreadMessages,
      dailyViews,
      topDemos: [], // Şimdilik boş
    })
  } catch (error) {
    console.error("İstatistik hatası:", error)
    return NextResponse.json({ error: "İstatistikler alınamadı" }, { status: 500 })
  }
}
