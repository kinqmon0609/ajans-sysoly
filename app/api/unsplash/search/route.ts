import { NextRequest, NextResponse } from "next/server"

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || ""

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json(
        { error: "Arama kelimesi gerekli" },
        { status: 400 }
      )
    }

    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: "Unsplash API key tanımlanmamış" },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unsplash search error:", error)
    return NextResponse.json(
      { error: "Görseller yüklenemedi" },
      { status: 500 }
    )
  }
}

