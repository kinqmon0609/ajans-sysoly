import { NextResponse } from "next/server"

// Gerçek verilerden paketler
const mockPackages = [
  { id: '7ba8bd8e-a714-11f0-b978-7df75ef09a30', name: 'Temel Paket', description: 'Küçük işletmeler için ideal başlangıç paketi', price: 2500.00, currency: 'TRY', features: '["5 Sayfa Tasarım", "Responsive Tasarım", "SEO Optimizasyonu", "İletişim Formu", "1 Yıl Domain + Hosting"]', is_popular: 0, is_active: 1, sort_order: 1, created_at: '2025-10-12 02:38:06', updated_at: '2025-10-12 02:38:06' },
  { id: '7ba8e73c-a714-11f0-b978-7df75ef09a30', name: 'Profesyonel Paket', description: 'Orta ölçekli işletmeler için kapsamlı çözüm', price: 5000.00, currency: 'TRY', features: '["10 Sayfa Tasarım", "Responsive Tasarım", "Gelişmiş SEO", "Blog Modülü", "Admin Paneli", "E-posta Entegrasyonu", "1 Yıl Domain + Hosting", "3 Ay Ücretsiz Destek"]', is_popular: 1, is_active: 1, sort_order: 2, created_at: '2025-10-12 02:38:06', updated_at: '2025-10-12 02:38:06' },
  { id: '7ba8e890-a714-11f0-b978-7df75ef09a30', name: 'Kurumsal Paket', description: 'Büyük işletmeler için tam özellikli çözüm', price: 10000.00, currency: 'TRY', features: '["Sınırsız Sayfa", "Responsive Tasarım", "Premium SEO", "E-Ticaret Modülü", "Blog & Portfolyo", "Gelişmiş Admin Paneli", "Özel Entegrasyonlar", "SSL Sertifikası", "1 Yıl Domain + Hosting", "6 Ay Ücretsiz Destek", "Performans Optimizasyonu"]', is_popular: 0, is_active: 1, sort_order: 3, created_at: '2025-10-12 02:38:06', updated_at: '2025-10-12 02:38:06' }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    // Admin paneli için tüm paketler, public için sadece aktif paketler
    const packages = includeInactive ? mockPackages : mockPackages.filter(pkg => pkg.is_active)

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json({ error: "Paketler yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const result = await createPackage(body)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error creating package:", error)
    return NextResponse.json({ error: "Paket oluşturulurken hata oluştu" }, { status: 500 })
  }
}

