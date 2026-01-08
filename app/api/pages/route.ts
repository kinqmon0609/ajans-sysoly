import { type NextRequest, NextResponse } from "next/server"
import { getPages } from "@/lib/mysql/queries"
import pool from "@/lib/mysql/client"

// Gerçek verilerden sayfalar - TAM İÇERİKLER (DEPRECATED - now using database)
const mockPages = [
  {
    id: '1c6f7298-a6b2-11f0-af23-eb6435dcb1e1',
    title: 'Hizmetlerimiz',
    slug: 'hizmetlerimiz',
    description: 'Sunduğumuz profesyonel hizmetler',
    content: '{"sections": [{"id": "hero-hizmetler", "type": "hero", "style": {"textColor": "#ffffff", "gradientTo": "#8b5cf6", "useGradient": true, "gradientFrom": "#3b82f6", "gradientDirection": "to-br"}, "title": "Hizmetlerimiz", "subtitle": "Dijital Dünyada Başarınız İçin", "description": "Modern teknolojiler ve yaratıcı çözümlerle işletmenizi dijital dünyada zirveye taşıyoruz. Web tasarımdan mobil uygulamaya, e-ticaretten dijital pazarlamaya kadar tüm ihtiyaçlarınız için buradayız."}, {"id": "service-cards-main", "type": "service-cards", "items": [{"url": "/web-tasarim", "icon": "Code", "title": "Web Tasarım", "description": "Modern, responsive ve kullanıcı dostu web siteleri. SEO uyumlu, hızlı yüklenen ve profesyonel tasarımlar."}, {"url": "/mobil-uygulama", "icon": "Smartphone", "title": "Mobil Uygulama", "description": "iOS ve Android için native mobil uygulamalar. Yüksek performanslı ve kullanıcı deneyimi odaklı çözümler."}, {"url": "/e-ticaret", "icon": "ShoppingCart", "title": "E-Ticaret", "description": "Güvenli ödeme sistemleri, stok yönetimi ve müşteri yönetimi ile eksiksiz online mağaza çözümleri."}, {"url": "/ozel-yazilim", "icon": "Code", "title": "Özel Yazılım", "description": "İşletmenize özel, ölçeklenebilir yazılım çözümleri. İhtiyaçlarınıza göre tasarlanmış sistemler."}, {"url": "/dijital-pazarlama", "icon": "TrendingUp", "title": "Dijital Pazarlama", "description": "SEO, Google Ads ve sosyal medya yönetimi ile markanızı dijital dünyada büyütün."}, {"url": "/grafik-tasarim", "icon": "Palette", "title": "Grafik Tasarım", "description": "Logo tasarımı, kurumsal kimlik ve görsel içerikler. Markanızı öne çıkaran yaratıcı tasarımlar."}], "style": {"padding": "large"}, "title": "Sunduğumuz Hizmetler"}, {"id": "stats-hizmetler", "type": "stats", "items": [{"icon": "star", "label": "Tamamlanan Proje", "value": "500+"}, {"icon": "heart", "label": "Mutlu Müşteri", "value": "250+"}, {"icon": "activity", "label": "Yıllık Deneyim", "value": "10+"}, {"icon": "award", "label": "Müşteri Memnuniyeti", "value": "%98"}], "style": {"textColor": "#ffffff", "gradientTo": "#334155", "useGradient": true, "gradientFrom": "#1e293b", "gradientDirection": "to-r"}, "title": "Rakamlarla Biz"}, {"id": "content-neden", "type": "content", "style": {"gradientTo": "#e0f2fe", "useGradient": true, "gradientFrom": "#f0f9ff", "gradientDirection": "to-br"}, "title": "Neden Bizi Seçmelisiniz?", "content": "10 yılı aşkın deneyimimiz, uzman ekibimiz ve müşteri odaklı yaklaşımımızla projelerinizi en iyi şekilde hayata geçiriyoruz. Kaliteli hizmet, zamanında teslimat ve sürekli destek garantisi sunuyoruz."}, {"id": "cta-hizmetler", "type": "cta", "style": {"textColor": "#ffffff", "gradientTo": "#10b981", "useGradient": true, "gradientFrom": "#059669", "gradientDirection": "to-r"}, "title": "Projenizi Konuşalım", "buttonUrl": "/teklif-formu", "buttonText": "Teklif Alın", "description": "Ücretsiz danışmanlık için bizimle iletişime geçin. Size özel çözümler üretelim."}, {"id": "features-avantajlar", "type": "features", "items": [{"icon": "shield", "title": "Güvenilir Hizmet", "description": "ISO sertifikalı, güvenli ve kaliteli hizmet anlayışı"}, {"icon": "clock", "title": "Hızlı Teslimat", "description": "Belirlenen sürede eksiksiz proje teslimi"}, {"icon": "users", "title": "Uzman Ekip", "description": "Alanında deneyimli ve sertifikalı profesyoneller"}, {"icon": "heart", "title": "7/24 Destek", "description": "Sürekli teknik destek ve bakım hizmeti"}], "title": "Avantajlarımız"}]}',
    meta_title: 'Hizmetlerimiz - Demo Vitrin',
    meta_description: 'Profesyonel web geliştirme, mobil uygulama ve e-ticaret hizmetleri',
    meta_keywords: null,
    is_active: 1,
    sort_order: 2,
    created_at: '2025-10-11 14:53:55',
    updated_at: '2025-10-12 03:00:48'
  },
  {
    id: '1c6f77c0-a6b2-11f0-af23-eb6435dcb1e1',
    title: 'E-Ticaret Çözümleri',
    slug: 'e-ticaret',
    description: 'Güçlü e-ticaret altyapıları',
    content: '{"sections": [{"id": "hero-1", "type": "hero", "style": {"padding": "large", "backgroundColor": "#f8fafc"}, "title": "E-Ticaret Çözümleri", "subtitle": "Dijital Satış Platformlarınız", "description": "Profesyonel e-ticaret altyapısı ile online satışlarınızı artırın. Modern, hızlı ve güvenli e-ticaret platformları."}, {"id": "content-1", "type": "content", "style": {"padding": "normal", "alignment": "center"}, "title": "Neden E-Ticaret?", "content": "E-ticaret, işletmenizin 7/24 açık olmasını sağlar. Müşterileriniz istedikleri zaman, istedikleri yerden alışveriş yapabilir. Coğrafi sınırlamaları ortadan kaldırarak daha geniş bir müşteri kitlesine ulaşabilirsiniz."}, {"id": "features-1", "type": "features", "items": [{"icon": "ShoppingCart", "title": "Gelişmiş Ürün Yönetimi", "description": "Sınırsız ürün, kategori ve varyasyon yönetimi. Toplu ürün yükleme ve güncelleme"}, {"icon": "CreditCard", "title": "Güvenli Ödeme Sistemi", "description": "Kredi kartı, havale, kapıda ödeme gibi tüm ödeme yöntemleri. SSL sertifikası ile güvenli alışveriş"}, {"icon": "Truck", "title": "Kargo Entegrasyonu", "description": "MNG, Yurtiçi, Aras, PTT gibi tüm kargo firmalarıyla otomatik entegrasyon"}, {"icon": "Users", "title": "Müşteri Yönetimi", "description": "Detaylı müşteri profilleri, sipariş geçmişi, favori listesi ve hediye çeki sistemi"}], "style": {"padding": "large", "backgroundColor": "#ffffff"}, "title": "E-Ticaret Özelliklerimiz", "description": "Başarılı bir online mağaza için ihtiyacınız olan her şey"}]}',
    meta_title: 'E-Ticaret Çözümleri - Demo Vitrin',
    meta_description: 'Komisyonsuz e-ticaret altyapısı ile online satışa başlayın',
    meta_keywords: null,
    is_active: 1,
    sort_order: 3,
    created_at: '2025-10-11 14:53:55',
    updated_at: '2025-10-12 00:11:53'
  },
  {
    id: '2dbb3d1c-a6d9-11f0-af23-eb6435dcb1e1',
    title: 'Hakkımızda',
    slug: 'hakkimizda',
    description: 'Biz kimiz, ne yapıyoruz?',
    content: '{"sections": [{"id": "hero-1", "type": "hero", "title": "Hakkımızda", "subtitle": "Dijital Dünyanın Mimarları", "description": "Modern web teknolojileri ve yenilikçi çözümlerle işletmenizin dijital dönüşümünü gerçekleştiriyoruz."}, {"id": "content-1", "type": "content", "title": "Biz Kimiz?", "content": "Demo Vitrin olarak, işletmelerin dijital dünyada güçlü bir varlık oluşturmasına yardımcı oluyoruz. Uzman ekibimiz ve yılların deneyimiyle, her ölçekte projeye özel çözümler sunuyoruz."}, {"id": "content-2", "type": "content", "style": {"useGradient": false}, "title": "Vizyonumuz", "content": "Türkiye\'nin önde gelen dijital ajanslarından biri olmak ve müşterilerimize dünya standartlarında hizmet sunmak vizyonumuzun merkezinde yer alıyor."}, {"id": "features-1", "type": "features", "items": [{"icon": "search", "title": "Müşteri Odaklılık", "description": "Her projeyi müşteri memnuniyeti odağında yönetiyoruz"}, {"icon": "award", "title": "Kalite", "description": "En yüksek kalite standartlarında çözümler sunuyoruz"}, {"icon": "users", "title": "Ekip Çalışması", "description": "Güçlü ekibimizle her projeye değer katıyoruz"}, {"icon": "trending-up", "title": "Sürekli Gelişim", "description": "Teknolojik gelişmeleri takip ediyor, kendimizi sürekli geliştiriyoruz"}], "title": "Değerlerimiz"}, {"id": "stats-1", "type": "stats", "items": [{"icon": "users", "label": "Mutlu Müşteri", "value": "500+"}, {"icon": "package", "label": "Tamamlanan Proje", "value": "1000+"}, {"icon": "award", "label": "Yıllık Deneyim", "value": "10+"}], "title": "Rakamlarla Biz", "description": "Yıllardır süregelen başarımızın kanıtı"}]}',
    meta_title: 'Hakkımızda - Demo Vitrin',
    meta_description: 'Demo Vitrin hakkında bilgi edinin. Değerlerimiz, vizyonumuz ve ekibimiz.',
    meta_keywords: null,
    is_active: 1,
    sort_order: 1,
    created_at: '2025-10-11 19:33:35',
    updated_at: '2025-10-14 16:15:55'
  },
  {
    id: '4a0b880a-a6d9-11f0-af23-eb6435dcb1e1',
    title: 'Sıkça Sorulan Sorular',
    slug: 'sss',
    description: 'En çok merak edilen sorular ve cevapları',
    content: '[{"id": "hero-1", "type": "hero", "title": "Sıkça Sorulan Sorular", "subtitle": "Merak Ettikleriniz", "description": "En çok sorulan sorulara hızlı cevaplar bulabilirsiniz."}, {"id": "faq-hizmetler", "type": "faq", "items": [{"answer": "Web tasarım, mobil uygulama geliştirme, e-ticaret çözümleri, SEO optimizasyonu ve dijital pazarlama hizmetleri sunuyoruz. Her projeyi müşterilerimizin ihtiyaçlarına özel olarak tasarlıyoruz.", "question": "Ne tür hizmetler sunuyorsunuz?"}, {"answer": "Projenin kapsamına göre değişmekle birlikte, ortalama bir web sitesi projesi 4-8 hafta sürmektedir. Daha karmaşık e-ticaret projeleri 8-12 hafta arasında tamamlanır. Detaylı bir zaman çizelgesi için bizimle iletişime geçebilirsiniz.", "question": "Proje süresi ne kadar?"}], "title": "Hizmetlerimiz Hakkında", "description": "Sunduğumuz hizmetler ve çalışma süreçlerimiz hakkında"}]',
    meta_title: 'SSS - Demo Vitrin',
    meta_description: 'Sıkça sorulan sorular ve cevapları. Hizmetlerimiz, fiyatlandırma ve destek hakkında bilgi edinin.',
    meta_keywords: null,
    is_active: 1,
    sort_order: 4,
    created_at: '2025-10-11 19:34:22',
    updated_at: '2025-10-11 19:43:29'
  },
  {
    id: '603431d6-a6d9-11f0-af23-eb6435dcb1e1',
    title: 'İletişim',
    slug: 'iletisim',
    description: 'Bizimle iletişime geçin',
    content: '[{"id": "hero-1", "type": "hero", "title": "İletişim", "subtitle": "Bizimle İletişime Geçin", "description": "Projeleriniz için bizimle iletişime geçin, size en uygun çözümü birlikte bulalım."}, {"id": "content-1", "type": "content", "title": "Bize Ulaşın", "content": "Aşağıdaki formu doldurarak bizimle iletişime geçebilirsiniz. En kısa sürede size geri dönüş yapacağız."}, {"id": "features-1", "type": "features", "items": [{"icon": "mail", "title": "E-posta", "description": "info@demovitrin.com"}, {"icon": "phone", "title": "Telefon", "description": "+90 555 123 45 67"}, {"icon": "map-pin", "title": "Adres", "description": "İstanbul, Türkiye"}, {"icon": "clock", "title": "Çalışma Saatleri", "description": "Pzt-Cum: 09:00 - 18:00"}], "title": "İletişim Bilgileri"}]',
    meta_title: 'İletişim - Demo Vitrin',
    meta_description: 'Demo Vitrin ile iletişime geçin. Telefon, e-posta ve iletişim formu.',
    meta_keywords: null,
    is_active: 1,
    sort_order: 5,
    created_at: '2025-10-11 19:35:00',
    updated_at: '2025-10-11 19:36:27'
  },
  {
    id: '8a388e24-a714-11f0-b978-7df75ef09a30',
    title: 'Paketlerimiz',
    slug: 'paketlerimiz',
    description: 'Hizmet paketlerimiz ve fiyatlandırma',
    content: '[{"id": "hero-1", "type": "hero", "title": "Paketlerimiz", "subtitle": "Size Özel Çözümler", "description": "İhtiyaçlarınıza uygun en iyi çözümü bulmak için paketlerimizi inceleyin"}]',
    meta_title: 'Paketlerimiz - Demo Vitrin',
    meta_description: 'Web tasarım ve yazılım paketlerimizi inceleyin. Size en uygun paketi bulun.',
    meta_keywords: null,
    is_active: 1,
    sort_order: 2,
    created_at: '2025-10-12 02:38:30',
    updated_at: '2025-10-12 02:38:30'
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get("includeInactive") === "true"

    // Fetch from database
    const allPages = await getPages()

    // Filter by active status if needed
    const filteredPages = includeInactive ? allPages : allPages.filter((page: any) => page.is_active)

    return NextResponse.json(filteredPages)
  } catch (error) {
    console.error("❌ Pages fetch error:", error)
    console.log("🔄 Mock data kullanılıyor")
    // Fallback to mock data
    const filteredPages = includeInactive ? mockPages : mockPages.filter((page: any) => page.is_active);
    return NextResponse.json(filteredPages);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const pool = dbPool;

    // Content'i JSON string olarak kaydet
    const contentJson = JSON.stringify(body.content || [])

    const [result] = await pool.execute(`
      INSERT INTO pages (title, slug, description, content, meta_title, meta_description, meta_keywords, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.title,
      body.slug,
      body.description || null,
      contentJson,
      body.meta_title || null,
      body.meta_description || null,
      body.meta_keywords || null,
      body.is_active ?? true,
      body.sort_order ?? 0
    ])

    // Oluşturulan sayfayı geri dön
    const insertId = (result as any).insertId || (result as any)[0]?.id
    if (insertId) {
      const [rows] = await pool.execute('SELECT * FROM pages WHERE id = ?', [insertId])
      const page = (rows as any)[0]
      
      // JSON parse et
      if (typeof page.content === 'string') {
        try {
          page.content = JSON.parse(page.content)
        } catch (error) {
          page.content = []
        }
      }
      
      return NextResponse.json(page)
    } else {
      // Supabase için son eklenen sayfayı al
      const [rows] = await pool.execute('SELECT * FROM pages ORDER BY created_at DESC LIMIT 1')
      const page = (rows as any)[0]
      
      // JSON parse et
      if (typeof page.content === 'string') {
        try {
          page.content = JSON.parse(page.content)
        } catch (error) {
          page.content = []
        }
      }
      
      return NextResponse.json(page)
    }
  } catch (error) {
    console.error("Page creation error:", error)
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const pool = dbPool;

    await pool.execute(`
      UPDATE pages 
      SET title = ?, slug = ?, description = ?, content = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, is_active = ?, display_order = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      body.title,
      body.slug,
      body.description || null,
      JSON.stringify(body.content || []),
      body.meta_title || null,
      body.meta_description || null,
      body.meta_keywords || null,
      body.is_active ?? true,
      body.display_order ?? 0,
      body.id
    ])

    const [rows] = await pool.execute('SELECT * FROM pages WHERE id = ?', [body.id])
    const page = (rows as any)[0]

    // JSON parse et
    if (typeof page.content === 'string') {
      try {
        page.content = JSON.parse(page.content)
      } catch (error) {
        page.content = []
      }
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Page update error:", error)
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Page ID is required" }, { status: 400 })
    }

    const pool = dbPool;
    await pool.execute('DELETE FROM pages WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Page deletion error:", error)
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 })
  }
}
