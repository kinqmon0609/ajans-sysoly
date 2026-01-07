import { NextRequest, NextResponse } from "next/server"

import { getUsersBySource } from "@/lib/google-analytics/queries"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate") || "30daysAgo"
    const endDate = searchParams.get("endDate") || "today"

    const data = await getUsersBySource({ startDate, endDate })

    return NextResponse.json({ sources: data })
  } catch (error) {
    console.error("Sources data error:", error)
    return NextResponse.json(
      { error: "Kaynak verileri alınamadı" },
      { status: 500 }
    )
  }
}

