import { type NextRequest, NextResponse } from "next/server"

// DISABLED: Supabase dependency removed for performance
// Analytics already tracks page views via /api/analytics/track

export async function POST(request: NextRequest) {
  // Return success immediately - no Supabase dependency
  return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
  // Return mock data - no Supabase dependency
  const searchParams = request.nextUrl.searchParams
  const demo_id = searchParams.get("demo_id")

  if (demo_id) {
    return NextResponse.json({ count: 0 })
  } else {
    return NextResponse.json({ viewCounts: {} })
  }
}
