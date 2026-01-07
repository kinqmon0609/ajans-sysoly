"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Mail, Phone, Building2, Calendar, DollarSign, Loader2, Trash2 } from "lucide-react"

interface QuoteRequest {
  id: string
  company_name: string | null
  contact_name: string
  email: string
  phone: string | null
  service_type: string
  project_details: string | null
  budget_range: string | null
  timeline: string | null
  additional_info: string | null
  status: "new" | "contacted" | "in_progress" | "completed" | "rejected"
  created_at: string
  updated_at: string
}

const serviceLabels: Record<string, string> = {
  "web-tasarim": "Web Tasarım",
  "ozel-yazilim": "Özel Yazılım",
  "mobil-uygulama": "Mobil Uygulama",
  "e-ticaret": "E-Ticaret",
  "dijital-pazarlama": "Dijital Pazarlama",
  "grafik-tasarim": "Grafik Tasarım",
  "sosyal-medya": "Sosyal Medya Yönetimi"
}

const statusLabels: Record<string, string> = {
  new: "Yeni",
  contacted: "İletişime Geçildi",
  in_progress: "İşlemde",
  completed: "Tamamlandı",
  rejected: "Reddedildi"
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
}

export default function QuoteRequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [request, setRequest] = useState<QuoteRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequest()
  }, [params.id])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/quote-requests/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setRequest(data)
    } catch (error) {
      console.error("Error fetching quote request:", error)
      toast({
        title: "Hata",
        description: "Teklif talebi yüklenemedi",
        variant: "destructive"
      })
      router.push("/admin/quote-requests")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    if (!request) return
    
    try {
      const response = await fetch(`/api/quote-requests/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error("Failed to update")
      
      toast({
        title: "Başarılı",
        description: "Durum güncellendi"
      })
      setRequest({ ...request, status: status as any })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Durum güncellenemedi",
        variant: "destructive"
      })
    }
  }

  const deleteRequest = async () => {
    if (!request || !confirm("Bu teklif talebini silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/quote-requests/${request.id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Failed to delete")
      
      toast({
        title: "Başarılı",
        description: "Teklif talebi silindi"
      })
      router.push("/admin/quote-requests")
    } catch (error) {
      toast({
        title: "Hata",
        description: "Teklif talebi silinemedi",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Teklif talebi bulunamadı</h2>
        <Button onClick={() => router.push("/admin/quote-requests")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => router.push("/admin/quote-requests")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Tüm Taleplere Dön
      </Button>

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {request.contact_name}
              </h1>
              <Badge className={`${statusColors[request.status]} text-base px-4 py-1`}>
                {statusLabels[request.status]}
              </Badge>
            </div>
            {request.company_name && (
              <div className="flex items-center gap-2 text-gray-600 text-lg">
                <Building2 className="h-5 w-5" />
                <span className="font-semibold">{request.company_name}</span>
              </div>
            )}
            <div className="text-sm text-gray-500 mt-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(request.created_at).toLocaleDateString("tr-TR", { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={deleteRequest}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300 border-2"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Talebi Sil
          </Button>
        </div>
      </div>

      {/* Status Update Card */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl shadow-lg p-8">
        <label className="text-lg font-bold text-blue-900 mb-4 block flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
          Durum Güncelle
        </label>
        <Select
          value={request.status}
          onValueChange={(value) => updateStatus(value)}
        >
          <SelectTrigger className="bg-white border-blue-300 border-2 h-12 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">🆕 Yeni</SelectItem>
            <SelectItem value="contacted">📞 İletişime Geçildi</SelectItem>
            <SelectItem value="in_progress">⚙️ İşlemde</SelectItem>
            <SelectItem value="completed">✅ Tamamlandı</SelectItem>
            <SelectItem value="rejected">❌ Reddedildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contact Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-8 hover:border-blue-300 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">E-posta Adresi</div>
          </div>
          <a 
            href={`mailto:${request.email}`} 
            className="text-blue-600 hover:text-blue-700 font-semibold text-lg break-all hover:underline block"
          >
            {request.email}
          </a>
        </div>

        {request.phone && (
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-8 hover:border-green-300 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">Telefon Numarası</div>
            </div>
            <a 
              href={`tel:${request.phone}`} 
              className="text-green-600 hover:text-green-700 font-semibold text-lg hover:underline block"
            >
              {request.phone}
            </a>
          </div>
        )}
      </div>

      {/* Service, Budget, Timeline Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
          <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3">Hizmet Türü</div>
          <div className="text-2xl font-black text-purple-900">
            {serviceLabels[request.service_type] || request.service_type}
          </div>
        </div>

        {request.budget_range && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Bütçe Aralığı
            </div>
            <div className="text-2xl font-black text-green-900">
              {request.budget_range}
            </div>
          </div>
        )}

        {request.timeline && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Zaman Çizelgesi
            </div>
            <div className="text-2xl font-black text-orange-900">
              {request.timeline}
            </div>
          </div>
        )}
      </div>

      {/* Project Details */}
      {request.project_details && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">📝</span>
            </div>
            <h2 className="font-black text-2xl">Proje Detayları</h2>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 whitespace-pre-wrap text-gray-700 leading-relaxed border-2 border-gray-200 text-base">
            {request.project_details}
          </div>
        </div>
      )}

      {/* Additional Info */}
      {request.additional_info && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">💡</span>
            </div>
            <h2 className="font-black text-2xl">Ek Bilgiler</h2>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-yellow-50 rounded-xl p-6 whitespace-pre-wrap text-gray-700 leading-relaxed border-2 border-gray-200 text-base">
            {request.additional_info}
          </div>
        </div>
      )}
    </div>
  )
}

