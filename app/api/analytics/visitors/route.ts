import { NextResponse } from "next/server"
import pool from "@/lib/mysql/client"

export async function GET() {
  try {
    // Son 5 dakikada aktif olan ziyaretçiler
    const [result] = await pool.execute(`
      SELECT COUNT(DISTINCT visitor_id) as count
      FROM active_visitors
      WHERE last_seen >= datetime('now', '-5 minutes')
    `)

    const count = (result as any)[0]?.count || 0

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Active visitors fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch visitors" }, { status: 500 })
  }
}


