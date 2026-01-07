"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Globe, Clock, Activity, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

interface Visitor {
  visitor_id: string
  current_page: string
  visitor_ip: string
  last_seen: string
  seconds_ago: number
}

interface PageStat {
  current_page: string
  visitor_count: number
}

export default function RealtimePage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [pageStats, setPageStats] = useState<PageStat[]>([])
  const [totalActive, setTotalActive] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRealtimeData()
    // Polling interval'i 30 saniyeye çıkar (performans için)
    const interval = setInterval(fetchRealtimeData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchRealtimeData = async () => {
    try {
      const response = await fetch("/api/analytics/realtime")
      if (response.ok) {
        const data = await response.json()
        setVisitors(data.visitors || [])
        setPageStats(data.pageStats || [])
        setTotalActive(data.totalActive || 0)
      }
    } catch (error) {
      console.error("Failed to fetch realtime data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPageTitle = (path: string) => {
    if (path === '/' || path === '') return 'Ana Sayfa'
    return path
  }

  const getActivityColor = (secondsAgo: number) => {
    if (secondsAgo < 30) return 'bg-green-500'
    if (secondsAgo < 120) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getActivityStatus = (secondsAgo: number) => {
    if (secondsAgo < 30) return 'Şu anda'
    if (secondsAgo < 120) return 'Yakın zamanda'
    return 'Birkaç dakika önce'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-green-600 animate-pulse" />
            Anlık Ziyaretçiler
          </h1>
          <p className="text-muted-foreground mt-1">Şu anda sitede gezinen kullanıcılar</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-green-600">{totalActive}</div>
          <div className="text-sm text-muted-foreground">Aktif Ziyaretçi</div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Visitors List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Aktif Kullanıcılar
            </CardTitle>
            <CardDescription>Son 5 dakikada aktif olan ziyaretçiler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {visitors.length > 0 ? (
                visitors.map((visitor, index) => (
                  <div
                    key={visitor.visitor_id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Status Indicator */}
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${getActivityColor(visitor.seconds_ago)} ${visitor.seconds_ago < 30 ? 'animate-pulse' : ''}`} />
                    </div>

                    {/* Visitor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">{visitor.visitor_ip}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{getActivityStatus(visitor.seconds_ago)}</span>
                      </div>
                      <div className="font-semibold truncate text-sm">{getPageTitle(visitor.current_page)}</div>
                      <div className="text-xs text-muted-foreground truncate">{visitor.current_page}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(visitor.last_seen), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Şu anda aktif ziyaretçi yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pages Being Viewed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              En Çok Görüntülenen Sayfalar
            </CardTitle>
            <CardDescription>Şu anda hangi sayfalar görüntüleniyor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pageStats.length > 0 ? (
                pageStats.map((stat, index) => {
                  const percentage = Math.round((stat.visitor_count / totalActive) * 100)
                  
                  return (
                    <div key={index} className="space-y-2 animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="font-semibold text-sm truncate">{getPageTitle(stat.current_page)}</div>
                          <div className="text-xs text-muted-foreground truncate">{stat.current_page}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-lg font-bold text-green-600">{stat.visitor_count}</span>
                          <span className="text-xs text-muted-foreground">({percentage}%)</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Henüz sayfa görüntülenmesi yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-xs text-muted-foreground">
        <Activity className="inline h-3 w-3 mr-1 animate-pulse" />
        Her 3 saniyede otomatik güncelleniyor
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}


