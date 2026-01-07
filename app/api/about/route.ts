import { NextResponse } from "next/server"

import { getAboutContent } from "@/lib/mysql/queries"

export async function GET() {
  try {
    const sections = await getAboutContent()
    return NextResponse.json({ sections })
  } catch (error) {
    console.error("Hakkımızda içeriği yükleme hatası:", error)
    return NextResponse.json({ error: "İçerik yüklenemedi" }, { status: 500 })
  }
}
