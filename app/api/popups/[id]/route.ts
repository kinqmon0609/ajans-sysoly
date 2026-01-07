import { getPopupById, updatePopup, deletePopup } from "@/lib/mysql/queries"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const popup = await getPopupById(params.id)
    
    if (!popup) {
      return NextResponse.json({ error: "Popup bulunamadı" }, { status: 404 })
    }

    return NextResponse.json(popup)
  } catch (error) {
    console.error("Error fetching popup:", error)
    return NextResponse.json({ error: "Popup yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    await updatePopup(params.id, body)
    const updatedPopup = await getPopupById(params.id)
    
    return NextResponse.json({ success: true, popup: updatedPopup })
  } catch (error) {
    console.error("Error updating popup:", error)
    return NextResponse.json({ error: "Popup güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deletePopup(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting popup:", error)
    return NextResponse.json({ error: "Popup silinirken hata oluştu" }, { status: 500 })
  }
}



