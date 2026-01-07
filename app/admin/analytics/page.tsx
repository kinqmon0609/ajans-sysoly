"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Package, 
  ClipboardList, 
  Mail, 
  Eye, 
  Activity,
  Globe,
  MapPin,
  Monitor,
  CalendarIcon,
  Loader2,
  BarChart3
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"
import { format, subDays } from "date-fns"
import { tr } from "date-fns/locale"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

interface AnalyticsData {
  topPages: any[]
  topDemos: any[]
  topServices: any[]
  stats: {
    total_views: number
    unique_visitors: number
    total_quotes: number
    total_contacts: number
  }
  dailyViews: any[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  
  // Google Analytics states
  const [gaLoading, setGaLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [overviewData, setOverviewData] = useState<any>(null)
  const [realtimeUsers, setRealtimeUsers] = useState(0)
  const [trendsData, setTrendsData] = useState<any[]>([])
  const [countriesData, setCountriesData] = useState<any[]>([])
  const [citiesData, setCitiesData] = useState<any[]>([])
  const [pagesData, setPagesData] = useState<any[]>([])
  const [devicesData, setDevicesData] = useState<any[]>([])
  const [sourcesData, setSourcesData] = useState<any[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  useEffect(() => {
    fetchGoogleAnalytics()
  }, [dateRange])

  useEffect(() => {
    // Realtime data'yı sadece bir kez çek (polling kaldırıldı - performans için)
    fetchRealtimeData()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/reports?days=${days}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return format(date, "yyyy-MM-dd")
  }

  const fetchRealtimeData = async () => {
    try {
      const response = await fetch("/api/google-analytics/overview")
      if (response.ok) {
        const data = await response.json()
        setRealtimeUsers(data.realtime?.activeUsers || 0)
      }
    } catch (error) {
      // GA credentials yoksa sessizce hata ver
      console.warn("Google Analytics API kullanılamıyor (credentials eksik)")
      setRealtimeUsers(0)
    }
  }

  const fetchGoogleAnalytics = async () => {
    setGaLoading(true)
    try {
      const startDate = formatDate(dateRange.from)
      const endDate = formatDate(dateRange.to)
      const params = `startDate=${startDate}&endDate=${endDate}`

      // Timeout ile API çağrılarını sınırla (max 3 saniye)
      const fetchWithTimeout = async (url: string, timeout = 3000) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)
        
        try {
          const response = await fetch(url, { signal: controller.signal })
          clearTimeout(timeoutId)
          return await response.json()
        } catch (error) {
          clearTimeout(timeoutId)
          // Timeout veya fetch hatası - boş veri dön
          return null
        }
      }

      const [overview, trends, countries, cities, pages, devices, sources] = await Promise.all([
        fetchWithTimeout(`/api/google-analytics/overview?${params}`).then(data => data || ({ overview: null, realtime: { activeUsers: 0 } })),
        fetchWithTimeout(`/api/google-analytics/trends?${params}`).then(data => data || ({ trends: [] })),
        fetchWithTimeout(`/api/google-analytics/countries?${params}`).then(data => data || ({ countries: [] })),
        fetchWithTimeout(`/api/google-analytics/cities?${params}`).then(data => data || ({ cities: [] })),
        fetchWithTimeout(`/api/google-analytics/pages?${params}`).then(data => data || ({ pages: [] })),
        fetchWithTimeout(`/api/google-analytics/devices?${params}`).then(data => data || ({ devices: [] })),
        fetchWithTimeout(`/api/google-analytics/sources?${params}`).then(data => data || ({ sources: [] })),
      ])

      setOverviewData(overview.overview)
      setRealtimeUsers(overview.realtime?.activeUsers || 0)
      setTrendsData(trends.trends || [])
      setCountriesData(countries.countries || [])
      setCitiesData(cities.cities || [])
      setPagesData(pages.pages || [])
      setDevicesData(devices.devices || [])
      setSourcesData(sources.sources || [])
    } catch (error) {
      console.warn("Google Analytics API kullanılamıyor (credentials eksik)")
    } finally {
      setGaLoading(false)
    }
  }

  const quickRanges = [
    { label: "Bugün", days: 0 },
    { label: "Son 7 Gün", days: 7 },
    { label: "Son 30 Gün", days: 30 },
    { label: "Son 90 Gün", days: 90 },
  ]

  const stats = data?.stats || {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Site istatistikleri ve Google Analytics verileri</p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="site" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="site" className="text-base">
            <BarChart3 className="mr-2 h-4 w-4" />
            Site İstatistikleri
          </TabsTrigger>
          <TabsTrigger value="google" className="text-base">
            <Globe className="mr-2 h-4 w-4" />
            Google Analytics
          </TabsTrigger>
        </TabsList>

        {/* Site Statistics Tab */}
        <TabsContent value="site" className="space-y-6">
          {/* Date Range Selector */}
          <div className="flex gap-2">
            <Button variant={days === 7 ? "default" : "outline"} size="sm" onClick={() => setDays(7)}>
              7 Gün
            </Button>
            <Button variant={days === 30 ? "default" : "outline"} size="sm" onClick={() => setDays(30)}>
              30 Gün
            </Button>
            <Button variant={days === 90 ? "default" : "outline"} size="sm" onClick={() => setDays(90)}>
              90 Gün
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-blue-900">Toplam Görüntüleme</CardTitle>
                      <Eye className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">{stats.total_views?.toLocaleString() || 0}</div>
                    <p className="text-xs text-blue-700 mt-1">Son {days} gün</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-green-900">Benzersiz Ziyaretçi</CardTitle>
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">{stats.unique_visitors?.toLocaleString() || 0}</div>
                    <p className="text-xs text-green-700 mt-1">Tekil kullanıcı</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-purple-900">Teklif Talepleri</CardTitle>
                      <ClipboardList className="h-4 w-4 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">{stats.total_quotes || 0}</div>
                    <p className="text-xs text-purple-700 mt-1">Gelen teklif</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-orange-900">İletişim Mesajları</CardTitle>
                      <Mail className="h-4 w-4 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-900">{stats.total_contacts || 0}</div>
                    <p className="text-xs text-orange-700 mt-1">Gelen mesaj</p>
                  </CardContent>
                </Card>
              </div>

              {/* Site Stats Tabs */}
              <Tabs defaultValue="pages" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pages">En Çok Görüntülenen Sayfalar</TabsTrigger>
                  <TabsTrigger value="demos">En Çok Bakılan Demolar</TabsTrigger>
                  <TabsTrigger value="services">En Çok Talep Edilen Hizmetler</TabsTrigger>
                </TabsList>

                <TabsContent value="pages" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        En Çok Görüntülenen Sayfalar
                      </CardTitle>
                      <CardDescription>Son {days} gündeki en popüler sayfalar</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {data?.topPages && data.topPages.length > 0 ? (
                          data.topPages.map((page: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                                  #{index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold">{page.page_title || page.page_slug}</div>
                                  <div className="text-sm text-muted-foreground">/{page.page_slug}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">{page.views}</div>
                                <div className="text-xs text-muted-foreground">{page.unique_visitors} benzersiz</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8">Henüz veri yok</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="demos" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        En Çok Bakılan Demolar
                      </CardTitle>
                      <CardDescription>Son {days} gündeki en popüler demolar</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {data?.topDemos && data.topDemos.length > 0 ? (
                          data.topDemos.map((demo: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold">
                                  #{index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold">{demo.title}</div>
                                  <div className="text-sm text-muted-foreground">Demo ID: {demo.id.substring(0, 8)}...</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">{demo.views}</div>
                                <div className="text-xs text-muted-foreground">{demo.unique_visitors} benzersiz</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8">Henüz veri yok</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        En Çok Talep Edilen Hizmetler
                      </CardTitle>
                      <CardDescription>Teklif formunda en çok seçilen hizmetler</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {data?.topServices && data.topServices.length > 0 ? (
                          data.topServices.map((service: any, index: number) => {
                            const serviceNames: Record<string, string> = {
                              "web-tasarim": "Web Tasarım",
                              "ozel-yazilim": "Özel Yazılım",
                              "mobil-uygulama": "Mobil Uygulama",
                              "e-ticaret": "E-Ticaret",
                              "dijital-pazarlama": "Dijital Pazarlama",
                              "grafik-tasarim": "Grafik Tasarım"
                            }
                            
                            return (
                              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold">
                                    #{index + 1}
                                  </div>
                                  <div className="font-semibold">
                                    {serviceNames[service.service_type] || service.service_type}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold">{service.count}</div>
                                  <div className="text-xs text-muted-foreground">teklif talebi</div>
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-center text-muted-foreground py-8">Henüz veri yok</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </TabsContent>

        {/* Google Analytics Tab */}
        <TabsContent value="google" className="space-y-6">
          {/* Date Range Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Tarih Aralığı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quickRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDateRange({
                        from: range.days === 0 ? new Date() : subDays(new Date(), range.days),
                        to: new Date(),
                      })
                    }
                  >
                    {range.label}
                  </Button>
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to
                        ? `${format(dateRange.from, "dd MMM yyyy", { locale: tr })} - ${format(
                            dateRange.to,
                            "dd MMM yyyy",
                            { locale: tr }
                          )}`
                        : "Özel Tarih"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range: any) => {
                        if (range?.from && range?.to) {
                          setDateRange({ from: range.from, to: range.to })
                        }
                      }}
                      numberOfMonths={2}
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {gaLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : overviewData === null && realtimeUsers === 0 && trendsData.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Globe className="h-16 w-16 text-muted-foreground opacity-50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Google Analytics Yapılandırılmadı</h3>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      Google Analytics verilerini görmek için <code className="bg-muted px-2 py-1 rounded">.env</code> dosyanıza 
                      <code className="bg-muted px-2 py-1 rounded ml-1">GA_PROPERTY_ID</code> ve 
                      <code className="bg-muted px-2 py-1 rounded ml-1">GA_CREDENTIALS</code> ekleyin.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      Detaylı kurulum için <code className="bg-muted px-2 py-1 rounded">env.example</code> dosyasına bakın.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Realtime + Overview Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Anlık Ziyaretçi</CardTitle>
                    <Activity className="h-4 w-4 text-green-600 animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{realtimeUsers}</div>
                    <p className="text-xs text-muted-foreground">Şu anda aktif</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData?.users?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {overviewData?.newUsers || 0} yeni kullanıcı
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Oturumlar</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData?.sessions?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Ort. {Math.round(overviewData?.avgSessionDuration || 0)}s süre
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sayfa Görüntüleme</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewData?.pageViews?.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {overviewData?.bounceRate?.toFixed(1) || 0}% çıkma oranı
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Google Analytics Detail Tabs */}
              <Tabs defaultValue="trends" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
                  <TabsTrigger value="trends">Trendler</TabsTrigger>
                  <TabsTrigger value="geo">Coğrafya</TabsTrigger>
                  <TabsTrigger value="pages">Sayfalar</TabsTrigger>
                  <TabsTrigger value="devices">Cihazlar</TabsTrigger>
                  <TabsTrigger value="sources">Kaynaklar</TabsTrigger>
                  <TabsTrigger value="all">Özet</TabsTrigger>
                </TabsList>

                {/* Trends */}
                <TabsContent value="trends">
                  <Card>
                    <CardHeader>
                      <CardTitle>Zaman Bazlı Trendler</CardTitle>
                      <CardDescription>Kullanıcı, oturum ve sayfa görüntüleme trendleri</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={trendsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Kullanıcılar" />
                          <Line type="monotone" dataKey="sessions" stroke="#10b981" name="Oturumlar" />
                          <Line type="monotone" dataKey="pageViews" stroke="#f59e0b" name="Sayfa Görüntüleme" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Geography */}
                <TabsContent value="geo" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Ülkeler</CardTitle>
                        <CardDescription>En çok ziyaret edilen 10 ülke</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={countriesData.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="country" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="users" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Şehirler</CardTitle>
                        <CardDescription>En aktif 10 şehir</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {citiesData.slice(0, 10).map((city, index) => (
                            <div key={index} className="flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{city.city}</span>
                                <span className="text-sm text-muted-foreground">({city.country})</span>
                              </div>
                              <span className="text-sm font-bold">{city.users}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Pages */}
                <TabsContent value="pages">
                  <Card>
                    <CardHeader>
                      <CardTitle>En Popüler Sayfalar</CardTitle>
                      <CardDescription>En çok görüntülenen 20 sayfa</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {pagesData.slice(0, 20).map((page, index) => (
                          <div key={index} className="flex flex-col gap-1 border-b pb-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{page.title}</span>
                              <span className="text-sm font-bold">{page.views} görüntüleme</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{page.path}</span>
                              <div className="flex gap-4">
                                <span>Ort. {Math.round(page.avgDuration)}s</span>
                                <span>{page.bounceRate.toFixed(1)}% çıkma</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Devices */}
                <TabsContent value="devices">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cihaz Kategorileri</CardTitle>
                      <CardDescription>Kullanıcıların cihaz dağılımı</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={devicesData}
                            dataKey="users"
                            nameKey="device"
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            label
                          >
                            {devicesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sources */}
                <TabsContent value="sources">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trafik Kaynakları</CardTitle>
                      <CardDescription>Kullanıcılar nereden geliyor?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={sourcesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="source" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="sessions" fill="#3b82f6" name="Oturumlar" />
                          <Bar dataKey="users" fill="#10b981" name="Kullanıcılar" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* All Summary */}
                <TabsContent value="all" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Top 5 Ülke</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={countriesData.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="country" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="users" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Cihaz Dağılımı</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={devicesData}
                              dataKey="users"
                              nameKey="device"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {devicesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Genel Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Kullanıcılar" />
                          <Line type="monotone" dataKey="sessions" stroke="#10b981" name="Oturumlar" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
