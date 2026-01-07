"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, Eye, Trash2, Mail, Phone, Building2, Calendar, DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

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

export default function QuoteRequestsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/quote-requests?status=${statusFilter}`)
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching quote requests:", error)
      toast({
        title: "Hata",
        description: "Teklif talepleri yüklenemedi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteRequest = async (id: string) => {
    if (!confirm("Bu teklif talebini silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/quote-requests/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Failed to delete")
      
      toast({
        title: "Başarılı",
        description: "Teklif talebi silindi"
      })
      fetchRequests()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Teklif talebi silinemedi",
        variant: "destructive"
      })
    }
  }

  const filteredRequests = requests.filter(
    (req) =>
      req.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.company_name && req.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Teklif Talepleri
          </h1>
          <p className="text-muted-foreground mt-1">Gelen teklif taleplerini görüntüleyin ve yönetin</p>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
          <div className="text-white/80 text-sm font-medium mb-1">Toplam Talep</div>
          <div className="text-3xl font-bold text-white">{requests.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 shadow-lg">
          <div className="text-white/80 text-sm font-medium mb-1">Yeni Talep</div>
          <div className="text-3xl font-bold text-white">{requests.filter(r => r.status === 'new').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="İsim, e-posta veya şirket ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Durum filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="new">Yeni</SelectItem>
            <SelectItem value="contacted">İletişime Geçildi</SelectItem>
            <SelectItem value="in_progress">İşlemde</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
            <SelectItem value="rejected">Reddedildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">Teklif talebi bulunamadı</h3>
          <p className="text-muted-foreground">Yeni teklif talepleri burada görünecek</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Status Bar */}
              <div className={`h-2 ${
                request.status === 'new' ? 'bg-blue-500' :
                request.status === 'contacted' ? 'bg-yellow-500' :
                request.status === 'in_progress' ? 'bg-purple-500' :
                request.status === 'completed' ? 'bg-green-500' :
                'bg-red-500'
              }`} />
              
              {/* Card Content */}
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      {request.contact_name}
                    </h3>
                    {request.company_name && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Building2 className="h-3 w-3" />
                        {request.company_name}
                      </div>
                    )}
                  </div>
                  <Badge className={`${statusColors[request.status]} text-xs`}>
                    {statusLabels[request.status]}
                  </Badge>
                </div>

                {/* Service Badge */}
                <div className="mb-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {serviceLabels[request.service_type] || request.service_type}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <a href={`mailto:${request.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{request.email}</span>
                  </a>
                  {request.phone && (
                    <a href={`tel:${request.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      <Phone className="h-4 w-4" />
                      {request.phone}
                    </a>
                  )}
                </div>

                {/* Budget & Timeline */}
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Bütçe</div>
                    <div className="text-sm font-semibold flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      {request.budget_range || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Zaman</div>
                    <div className="text-sm font-semibold flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      {request.timeline || '-'}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="text-xs text-gray-500 mb-4">
                  {new Date(request.created_at).toLocaleDateString("tr-TR", { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.location.href = `/admin/quote-requests/${request.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detaylar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteRequest(request.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

