import { NextRequest, NextResponse } from "next/server"

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || ""

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json(
        { error: "URL gerekli" },
        { status: 400 }
      )
    }

    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: "Unsplash API key tanımlanmamış" },
        { status: 500 }
      )
    }

    // Trigger download (required by Unsplash API guidelines)
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unsplash download trigger error:", error)
    return NextResponse.json(
      { error: "Download trigger failed" },
      { status: 500 }
    )
  }
}

