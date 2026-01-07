import { type NextRequest, NextResponse } from "next/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase.from("notifications").update(body).eq("id", id).select().single()

    if (error) throw error

    return NextResponse.json({ notification: data })
  } catch (error) {
    console.error("Bildirim güncelleme hatası:", error)
    return NextResponse.json({ error: "Bildirim güncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const { id } = params

    const { error } = await supabase.from("notifications").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Bildirim silme hatası:", error)
    return NextResponse.json({ error: "Bildirim silinemedi" }, { status: 500 })
  }
}
