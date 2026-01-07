import { NextResponse } from "next/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import { getPageBySlug } from "@/lib/mysql/queries"

// Mock sayfa verileri
const mockPages: Record<string, any> = {
  "hakkimizda": {
    id: "hakkimizda",
    title: "Hakkımızda",
    slug: "hakkimizda",
    content: [
      {
        type: "heading",
        level: 1,
        text: "Hakkımızda"
      },
      {
        type: "paragraph",
        text: "Modern web çözümleri ile işletmenizi dijitale taşıyoruz. 5+ yıllık deneyimimizle size en uygun çözümleri sunuyoruz."
      }
    ],
    meta_description: "Hakkımızda sayfası - Modern web çözümleri",
    is_active: true
  },
  "iletisim": {
    id: "iletisim",
    title: "İletişim",
    slug: "iletisim", 
    content: [
      {
        type: "heading",
        level: 1,
        text: "İletişim"
      },
      {
        type: "paragraph",
        text: "Bizimle iletişime geçin. Size en uygun çözümü bulalım."
      }
    ],
    meta_description: "İletişim sayfası",
    is_active: true
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // MySQL'den sayfa çek
    let page;
    try {
      page = await getPageBySlug(slug)
      console.log('✅ Page loaded from MySQL:', page?.title || 'Not found');
    } catch (error) {
      console.error('❌ MySQL error, using mock data:', error)
      // MySQL hata verirse mock data kullan
      page = mockPages[slug]
    }
    
    // Eğer MySQL'den veri gelmediyse mock data kullan
    if (!page) {
      console.log('📝 Using mock page data for:', slug);
      page = mockPages[slug]
    }

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error fetching page by slug:", error)
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 })
  }
}