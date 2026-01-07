import { NextRequest, NextResponse } from "next/server"

import { getTimeTrendData } from "@/lib/google-analytics/queries"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate") || "30daysAgo"
    const endDate = searchParams.get("endDate") || "today"

    const data = await getTimeTrendData({ startDate, endDate })

    return NextResponse.json({ trends: data })
  } catch (error) {
    console.error("Trends data error:", error)
    return NextResponse.json(
      { error: "Trend verileri alınamadı" },
      { status: 500 }
    )
  }
}

