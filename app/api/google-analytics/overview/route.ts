import { NextRequest, NextResponse } from "next/server"

import { getOverviewMetrics, getRealtimeUsers } from "@/lib/google-analytics/queries"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate") || "30daysAgo"
    const endDate = searchParams.get("endDate") || "today"

    // Realtime ve overview metriklerini paralel olarak al
    const [realtimeData, overviewData] = await Promise.all([
      getRealtimeUsers(),
      getOverviewMetrics({ startDate, endDate }),
    ])

    return NextResponse.json({
      realtime: realtimeData,
      overview: overviewData,
    })
  } catch (error) {
    console.error("Analytics overview error:", error)
    return NextResponse.json(
      { error: "Analytics verileri alınamadı" },
      { status: 500 }
    )
  }
}

