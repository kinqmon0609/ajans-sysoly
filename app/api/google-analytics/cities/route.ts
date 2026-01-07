import { NextRequest, NextResponse } from "next/server"

import { getUsersByCity } from "@/lib/google-analytics/queries"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate") || "30daysAgo"
    const endDate = searchParams.get("endDate") || "today"

    const data = await getUsersByCity({ startDate, endDate })

    return NextResponse.json({ cities: data })
  } catch (error) {
    console.error("Cities data error:", error)
    return NextResponse.json(
      { error: "Şehir verileri alınamadı" },
      { status: 500 }
    )
  }
}

