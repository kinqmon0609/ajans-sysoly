import { type NextRequest, NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("faqs").select("*").eq("is_active", true).order("order_index")

    if (error) throw error

    return NextResponse.json({ faqs: data })
  } catch (error) {
    console.error("SSS yükleme hatası:", error)
    return NextResponse.json({ error: "SSS yüklenemedi" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const { data, error } = await supabase.from("faqs").insert(body).select().single()

    if (error) throw error

    return NextResponse.json({ faq: data })
  } catch (error) {
    console.error("SSS oluşturma hatası:", error)
    return NextResponse.json({ error: "SSS oluşturulamadı" }, { status: 500 })
  }
}
