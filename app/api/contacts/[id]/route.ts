import { NextResponse } from "next/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { is_read } = body

    const supabase = await createClient()

    const { data: contact, error } = await supabase.from("contacts").update({ is_read }).eq("id", id).select().single()

    if (error) {
      console.error("Error updating contact:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error("Error in PATCH /api/contacts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const supabase = await createClient()

    const { error } = await supabase.from("contacts").delete().eq("id", id)

    if (error) {
      console.error("Error deleting contact:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/contacts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
