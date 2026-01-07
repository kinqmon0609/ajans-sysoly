"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"

export function ActiveVisitorsCounter() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 120000) // 2 dakikada bir güncelle (performans için)
    return () => clearInterval(interval)
  }, [])

  const fetchCount = async () => {
    try {
      const response = await fetch("/api/analytics/visitors")
      if (response.ok) {
        const data = await response.json()
        setCount(data.count || 0)
      }
    } catch (error) {
      // Sessizce hata ver
      if (isLoading) {
        console.warn("Ziyaretçi sayısı alınamadı")
      }
      setCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
      <Users className={`h-4 w-4 text-green-600 ${count > 0 ? 'animate-pulse' : ''}`} />
      <div className="flex flex-col">
        <span className="text-xs text-green-600 font-semibold">
          {isLoading ? "..." : count}
        </span>
        <span className="text-[10px] text-green-600/70 leading-none">
          Aktif
        </span>
      </div>
    </div>
  )
}

