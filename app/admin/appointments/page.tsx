"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Calendar, Clock, User, Mail, Phone, Check, X, Loader2, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface Appointment {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  service_type?: string
  appointment_date: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  created_at: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    try {
      let url = "/api/appointments"
      if (filter !== "all") {
        url += `?status=${filter}`
      }

      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast.error("Randevular yüklenemedi")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success("Randevu durumu güncellendi")
        fetchAppointments()
      } else {
        toast.error("Güncelleme başarısız")
      }
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Güncelleme sırasında hata oluştu")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: { label: "Beklemede", variant: "secondary" },
      confirmed: { label: "Onaylandı", variant: "default" },
      cancelled: { label: "İptal Edildi", variant: "destructive" },
      completed: { label: "Tamamlandı", variant: "outline" }
    }
    const config = variants[status] || variants.pending

    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const totalAppointments = appointments.length
  const pendingCount = appointments.filter(a => a.status === 'pending').length
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length
  const todayCount = appointments.filter(a => {
    const appointmentDate = new Date(a.appointment_date)
    const today = new Date()
    return appointmentDate.toDateString() === today.toDateString() && (a.status === 'pending' || a.status === 'confirmed')
  }).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Randevu Yönetimi</h1>
          <p className="text-muted-foreground">Müşteri randevularını yönetin</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Beklemede</SelectItem>
            <SelectItem value="confirmed">Onaylandı</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
            <SelectItem value="cancelled">İptal Edildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Toplam</CardTitle>
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{totalAppointments}</div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Tüm randevular
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Bekleyen</CardTitle>
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{pendingCount}</div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Onay gerekiyor
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Onaylı</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{confirmedCount}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Aktif randevular
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Bugün</CardTitle>
            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{todayCount}</div>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Bugünkü randevular
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {appointment.customer_name}
                  </CardTitle>
                  <CardDescription>
                    {appointment.service_type || "Hizmet belirtilmedi"}
                  </CardDescription>
                </div>
                {getStatusBadge(appointment.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(appointment.appointment_date).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(appointment.appointment_date).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} ({appointment.duration_minutes} dk)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${appointment.customer_email}`} className="hover:underline">
                    {appointment.customer_email}
                  </a>
                </div>
                {appointment.customer_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${appointment.customer_phone}`} className="hover:underline">
                      {appointment.customer_phone}
                    </a>
                  </div>
                )}
              </div>

              {appointment.notes && (
                <div className="flex items-start gap-2 text-sm p-3 bg-muted rounded-md">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-muted-foreground">{appointment.notes}</p>
                </div>
              )}

              {appointment.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => updateStatus(appointment.id, 'confirmed')}>
                    <Check className="mr-2 h-4 w-4" />
                    Onayla
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(appointment.id, 'cancelled')}>
                    <X className="mr-2 h-4 w-4" />
                    İptal Et
                  </Button>
                </div>
              )}

              {appointment.status === 'confirmed' && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(appointment.id, 'completed')}>
                  <Check className="mr-2 h-4 w-4" />
                  Tamamlandı Olarak İşaretle
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {appointments.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Henüz randevu yok</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

