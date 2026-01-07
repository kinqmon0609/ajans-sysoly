import { type NextRequest, NextResponse } from "next/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli

import { recordBlogReaction } from "@/lib/mysql/queries"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { reaction } = body

    if (!reaction || !['like', 'love', 'share'].includes(reaction)) {
      return NextResponse.json(
        { error: "Geçersiz reaction türü" },
        { status: 400 }
      )
    }

    // Get user IP for tracking (optional, can be null)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    await recordBlogReaction(slug, reaction, ip)

    return NextResponse.json({ 
      success: true,
      message: "Geri bildiriminiz kaydedildi" 
    })
  } catch (error) {
    console.error("Reaction kaydetme hatası:", error)
    return NextResponse.json(
      { error: "Geri bildirim kaydedilemedi" },
      { status: 500 }
    )
  }
}

