"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Teklif Formu sayfası artık Randevu sayfası ile birleştirildi.
 * Bu sayfa otomatik olarak /randevu sayfasına yönlendirir.
 */
export default function QuoteFormPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Kullanıcıyı yeni birleştirilmiş forma yönlendir
    router.push("/randevu")
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  )
}
