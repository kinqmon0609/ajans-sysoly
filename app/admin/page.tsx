"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Eye, MessageSquare, TrendingUp, Loader2, ClipboardList, Mail, FileText, HardDrive, ArrowRight, Package, Clock, User, Phone, AlertCircle } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"
import PageWidget from "@/components/page-widget"
import ServicePagesWidget from "@/components/service-pages-widget"

interface Stats {
  totalDemos: number
  totalViews: number
  totalMessages: number
  unreadMessages: number
  totalQuotes: number
  newQuotes: number
  totalAppointments?: number
  pendingAppointments?: number
  confirmedAppointments?: number
  todayAppointments?: number
}

interface MediaStats {
  totalSizeFormatted: string
  totalFiles: number
}

interface Activity {
  type: string
  id: string
  title: string
  description: string
  created_at: string
}

interface UpcomingAppointment {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string | null
  service_type: string
  appointment_date: string
  duration_minutes: number
  status: string
  notes: string | null
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [mediaStats, setMediaStats] = useState<MediaStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchMediaStats()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard")
      const data = await response.json()
      setStats(data.stats)
      setActivities(data.activities || [])
      setUpcomingAppointments(data.upcomingAppointments || [])
    } catch (error) {
      console.error("Dashboard yükleme hatası:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMediaStats = async () => {
    try {
      const response = await fetch("/api/media?action=stats")
      const data = await response.json()
      setMediaStats(data)
    } catch (error) {
      console.error("Medya istatistikleri yükleme hatası:", error)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return <ClipboardList className="h-4 w-4" />
      case 'message':
        return <Mail className="h-4 w-4" />
      case 'page_view':
        return <Eye className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quote':
        return 'bg-purple-100 text-purple-600'
      case 'message':
        return 'bg-blue-100 text-blue-600'
      case 'page_view':
        return 'bg-green-100 text-green-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'quote':
        return 'Teklif Talebi'
      case 'message':
        return 'İletişim Mesajı'
      case 'page_view':
        return 'Sayfa Görüntüleme'
      default:
        return 'Aktivite'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Bekliyor</Badge>
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Onaylandı</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Tamamlandı</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">İptal</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Yönetim paneline hoş geldiniz</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/appointments">
            <Button variant="default" className="gap-2">
              <Calendar className="h-4 w-4" />
              Randevular
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Görüntülenme</CardTitle>
            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats?.totalViews?.toLocaleString() || 0}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Son 30 gün
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Mesajlar</CardTitle>
            <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats?.totalMessages || 0}</div>
            {(stats?.unreadMessages || 0) > 0 && (
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                {stats?.unreadMessages} okunmamış
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Teklif Talepleri</CardTitle>
            <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats?.totalQuotes || 0}</div>
            {(stats?.newQuotes || 0) > 0 && (
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                {stats?.newQuotes} yeni
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Randevular</CardTitle>
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats?.totalAppointments || 0}</div>
            {(stats?.pendingAppointments || 0) > 0 && (
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {stats?.pendingAppointments} bekliyor
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950 dark:to-sky-950 border-cyan-200 dark:border-cyan-800 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-900 dark:text-cyan-100">Disk Kullanımı</CardTitle>
            <HardDrive className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{mediaStats?.totalSizeFormatted || "0 MB"}</div>
            {mediaStats && (
              <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">
                {mediaStats.totalFiles} dosya
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Son Aktiviteler</CardTitle>
            <CardDescription>Sitenizdeki son hareketler</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity, index) => (
                  <div
                    key={`${activity.type}-${activity.id}-${index}`}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          {getActivityLabel(activity.type)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                      <div className="font-semibold truncate">{activity.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{activity.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Henüz aktivite yok</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Access Links */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Hızlı Erişim</CardTitle>
            <CardDescription>Sık kullanılan özellikler</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/admin/appointments">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4" size="lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Randevu Yönetimi</div>
                  <div className="text-xs text-muted-foreground">Randevuları görüntüle ve yönet</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/admin/messages">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4" size="lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Mesajlar</div>
                  <div className="text-xs text-muted-foreground">İletişim mesajlarını görüntüle</div>
                </div>
                {(stats?.unreadMessages || 0) > 0 && (
                  <Badge variant="destructive">{stats?.unreadMessages}</Badge>
                )}
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/admin/quotes">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4" size="lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Teklif Talepleri</div>
                  <div className="text-xs text-muted-foreground">Teklif taleplerini incele</div>
                </div>
                {(stats?.newQuotes || 0) > 0 && (
                  <Badge variant="secondary">{stats?.newQuotes}</Badge>
                )}
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/admin/demos">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4" size="lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                  <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Demolar</div>
                  <div className="text-xs text-muted-foreground">Demo portföyünü yönet</div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        </div>

        {/* Sayfalar Widget */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Sayfalar</CardTitle>
                <CardDescription>Sitenizdeki sayfaları yönetin</CardDescription>
              </div>
              <Link href="/admin/pages">
                <Button variant="ghost" size="sm" className="gap-2">
                  Tümünü Gör
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <PageWidget showActions={true} limit={6} showInactive={true} />
          </CardContent>
        </Card>

        {/* Hizmet Sayfaları Widget */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Hizmet Sayfaları</CardTitle>
                <CardDescription>Hizmet sayfalarınızı yönetin</CardDescription>
              </div>
              <Link href="/admin/pages">
                <Button variant="ghost" size="sm" className="gap-2">
                  Tümünü Gör
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ServicePagesWidget showActions={true} limit={6} showInactive={true} />
          </CardContent>
        </Card>

        {/* Yaklaşan Randevular */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Yaklaşan Randevular</CardTitle>
                <CardDescription>Önümüzdeki randevularınız</CardDescription>
              </div>
              <Link href="/admin/appointments">
                <Button variant="ghost" size="sm" className="gap-2">
                  Tümünü Gör
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0">
                      <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{appointment.customer_name}</h4>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{appointment.service_type}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(appointment.appointment_date), "d MMM yyyy, HH:mm", { locale: tr })}</span>
                        </div>
                        {appointment.customer_phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span className="truncate">{appointment.customer_phone}</span>
                          </div>
                        )}
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2 pt-1 border-t">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Yaklaşan randevu bulunmuyor</p>
                <Link href="/admin/appointments">
                  <Button variant="link" size="sm" className="mt-2">
                    Randevu Oluştur
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
