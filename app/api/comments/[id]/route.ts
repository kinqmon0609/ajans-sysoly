import { type NextRequest, NextResponse } from "next/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase
      .from("comments")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ comment: data })
  } catch (error) {
    console.error("Yorum güncelleme hatası:", error)
    return NextResponse.json({ error: "Yorum güncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()
    const { id } = params

    const { error } = await supabase.from("comments").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Yorum silme hatası:", error)
    return NextResponse.json({ error: "Yorum silinemedi" }, { status: 500 })
  }
}
