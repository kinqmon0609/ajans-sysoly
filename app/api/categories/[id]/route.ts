import { createServerClient } from "@/lib/supabase/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

    // Slug oluştur
    const slug = body.name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    // Mock data için güncellenmiş kategori
    const updatedCategory = {
      id: id,
      name: body.name,
      slug: slug,
      description: body.description || null,
      icon: body.icon || null,
      color: '#3B82F6',
      is_active: body.is_active,
      sort_order: body.display_order || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock data için silme işlemi
    // Gerçek uygulamada veritabanından silinir

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
