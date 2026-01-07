import { NextRequest, NextResponse } from "next/server"

import { getPageViews } from "@/lib/google-analytics/queries"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate") || "30daysAgo"
    const endDate = searchParams.get("endDate") || "today"

    const data = await getPageViews({ startDate, endDate })

    return NextResponse.json({ pages: data })
  } catch (error) {
    console.error("Pages data error:", error)
    return NextResponse.json(
      { error: "Sayfa verileri alınamadı" },
      { status: 500 }
    )
  }
}

