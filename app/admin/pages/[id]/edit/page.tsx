"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PageEditor } from "@/components/page-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { toast } from "sonner"

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPage()
  }, [params.id])

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/pages/${params.id}`)
      if (response.ok) {
        const pageData = await response.json()
        setPage(pageData)
      } else {
        toast.error("Sayfa bulunamadı")
        router.push("/admin/pages")
      }
    } catch (error) {
      console.error("Error fetching page:", error)
      toast.error("Sayfa yüklenirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (content: any) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/pages/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...page, // Mevcut sayfa verilerini koru
          content: content // Sadece content'i güncelle
        }),
      })

      if (response.ok) {
        toast.success("Sayfa başarıyla güncellendi")
        // Sayfayı yeniden yükle
        await fetchPage()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Sayfa güncellenirken hata oluştu")
      }
    } catch (error) {
      console.error("Error saving page:", error)
      toast.error("Sayfa kaydedilirken hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Sayfa yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Sayfa bulunamadı</p>
          <Button onClick={() => router.push("/admin/pages")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/pages")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{page.title}</h1>
              <p className="text-sm text-gray-500">Sayfa Düzenleyici</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/${page.slug}`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Önizle
            </Button>
            {saving && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Kaydediliyor...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Editor */}
      <div className="flex-1">
        <PageEditor page={page} onSave={handleSave} />
      </div>
    </div>
  )
}
