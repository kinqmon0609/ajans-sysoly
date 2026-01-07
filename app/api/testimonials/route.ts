import { type NextRequest, NextResponse } from "next/server"

// Gerçek verilerden testimonials
const mockTestimonials = [
  { id: '17e972f0-a6b2-11f0-af23-eb6435dcb1e1', name: 'Ahmet Yılmaz', company: 'ABC E-ticaret', position: 'Genel Müdür', content: 'Harika bir ekip! E-ticaret sitemizi çok kısa sürede hayata geçirdiler. Satışlarımız %200 arttı.', rating: 5, is_featured: 1, is_active: 1, sort_order: 1, created_at: '2025-10-11 14:53:48', updated_at: '2025-10-11 14:53:48' },
  { id: '17e975b6-a6b2-11f0-af23-eb6435dcb1e1', name: 'Ayşe Demir', company: 'XYZ Teknoloji', position: 'CTO', content: 'Profesyonel yaklaşımları ve teknik bilgileri sayesinde projemiz zamanında ve bütçe dahilinde tamamlandı.', rating: 5, is_featured: 1, is_active: 1, sort_order: 2, created_at: '2025-10-11 14:53:48', updated_at: '2025-10-11 14:53:48' },
  { id: '17e97674-a6b2-11f0-af23-eb6435dcb1e1', name: 'Mehmet Kaya', company: 'DEF Holding', position: 'IT Müdürü', content: 'Kurumsal web sitemiz için aldığımız hizmet mükemmeldi. Kesinlikle tavsiye ederim.', rating: 5, is_featured: 1, is_active: 1, sort_order: 3, created_at: '2025-10-11 14:53:48', updated_at: '2025-10-11 14:53:48' },
  { id: '17e976b0-a6b2-11f0-af23-eb6435dcb1e1', name: 'Zeynep Şahin', company: 'GHI Danışmanlık', position: 'Kurucu', content: 'Mobil uygulamamız çok beğenildi. Müşteri memnuniyeti çok yüksek.', rating: 4, is_featured: 0, is_active: 1, sort_order: 4, created_at: '2025-10-11 14:53:48', updated_at: '2025-10-11 14:53:48' }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get("featured")
    
    let testimonials = mockTestimonials;
    if (featured === "true") {
      testimonials = mockTestimonials.filter(t => t.is_featured);
    }
    
    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error("Referanslar yükleme hatası:", error)
    return NextResponse.json({ testimonials: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()

    const { data, error } = await supabase.from("testimonials").insert(body).select().single()

    if (error) throw error

    // Cache'i temizle
    testimonialsCache.clear()

    return NextResponse.json({ testimonial: data })
  } catch (error) {
    console.error("Referans oluşturma hatası:", error)
    return NextResponse.json({ error: "Referans oluşturulamadı" }, { status: 500 })
  }
}
