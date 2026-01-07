import { NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Bildirimleri okundu işaretleme hatası:", error)
    return NextResponse.json({ error: "Bildirimler işaretlenemedi" }, { status: 500 })
  }
}
