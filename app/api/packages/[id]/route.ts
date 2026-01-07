import { getPackageById, updatePackage, deletePackage } from "@/lib/mysql/queries"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pkg = await getPackageById(params.id)
    
    if (!pkg) {
      return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 })
    }

    return NextResponse.json(pkg)
  } catch (error) {
    console.error("Error fetching package:", error)
    return NextResponse.json({ error: "Paket yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    await updatePackage(params.id, body)
    const updatedPackage = await getPackageById(params.id)
    
    return NextResponse.json({ success: true, package: updatedPackage })
  } catch (error) {
    console.error("Error updating package:", error)
    return NextResponse.json({ error: "Paket güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deletePackage(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting package:", error)
    return NextResponse.json({ error: "Paket silinirken hata oluştu" }, { status: 500 })
  }
}

