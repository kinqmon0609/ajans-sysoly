import { NextRequest, NextResponse } from "next/server"

import { getUsersByDevice } from "@/lib/google-analytics/queries"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate") || "30daysAgo"
    const endDate = searchParams.get("endDate") || "today"

    const data = await getUsersByDevice({ startDate, endDate })

    return NextResponse.json({ devices: data })
  } catch (error) {
    console.error("Devices data error:", error)
    return NextResponse.json(
      { error: "Cihaz verileri alınamadı" },
      { status: 500 }
    )
  }
}

