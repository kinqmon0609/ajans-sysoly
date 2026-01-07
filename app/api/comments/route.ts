import { type NextRequest, NextResponse } from "next/server"

// DISABLED: Supabase dependency removed for performance
// TODO: Migrate to MySQL comments table

export async function GET(request: NextRequest) {
  // Return empty comments array - no Supabase dependency
  return NextResponse.json({ comments: [] })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // TODO: Save to MySQL comments table
    // For now, return success
    
    return NextResponse.json({ 
      comment: {
        id: Date.now().toString(),
        ...body,
        created_at: new Date().toISOString(),
        is_approved: false
      }
    })
  } catch (error) {
    console.error("Yorum oluşturma hatası:", error)
    return NextResponse.json({ error: "Yorum oluşturulamadı" }, { status: 500 })
  }
}
