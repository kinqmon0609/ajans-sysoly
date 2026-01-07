const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'ajans1.db'));

const servicePages = [
    {
        title: 'E-Ticaret Çözümleri',
        slug: 'e-ticaret',
        content: JSON.stringify({ "sections": [{ "id": "hero-eticaret", "type": "hero", "style": { "textColor": "#ffffff", "gradientTo": "#f59e0b", "useGradient": true, "gradientFrom": "#d97706", "gradientDirection": "to-br" }, "title": "E-Ticaret Çözümleri", "subtitle": "Online Satışlarınızı Artırın", "description": "Güvenli ödeme sistemleri, stok yönetimi ve müşteri yönetimi ile eksiksiz e-ticaret çözümleri." }, { "id": "content-eticaret", "type": "content", "title": "Neden E-Ticaret?", "content": "Dijital çağda işletmenizin online varlığı kritik önem taşıyor. Profesyonel e-ticaret çözümlerimizle 7/24 satış yapabilirsiniz." }, { "id": "features-eticaret", "type": "features", "items": [{ "icon": "shopping-cart", "title": "Kolay Ürün Yönetimi", "description": "Sezgisel admin paneli" }, { "icon": "credit-card", "title": "Güvenli Ödeme", "description": "SSL sertifikası" }, { "icon": "truck", "title": "Kargo Entegrasyonu", "description": "Tüm kargo firmalarıyla entegre" }, { "icon": "users", "title": "Müşteri Yönetimi", "description": "Detaylı müşteri profilleri" }], "title": "Özellikler" }] }),
        meta_title: 'E-Ticaret Çözümleri - Demo Vitrin',
        meta_description: 'Profesyonel e-ticaret web siteleri ve online mağaza çözümleri.',
        is_active: 1,
        sort_order: 6
    },
    {
        title: 'Web Tasarım',
        slug: 'web-tasarim',
        content: JSON.stringify({ "sections": [{ "id": "hero-web", "type": "hero", "style": { "textColor": "#ffffff", "gradientTo": "#3b82f6", "useGradient": true, "gradientFrom": "#2563eb", "gradientDirection": "to-br" }, "title": "Web Tasarım", "subtitle": "Markanızı Dijitalde Öne Çıkarın", "description": "Modern, responsive ve kullanıcı dostu web siteleri." }, { "id": "content-web", "type": "content", "title": "Profesyonel Web Tasarım", "content": "İşletmenizin dijital vitrini olan web siteniz, müşterilerinizle ilk temas noktanızdır." }, { "id": "features-web", "type": "features", "items": [{ "icon": "smartphone", "title": "Responsive Tasarım", "description": "Tüm cihazlarda mükemmel görünüm" }, { "icon": "zap", "title": "Hızlı Yükleme", "description": "Optimize edilmiş performans" }, { "icon": "search", "title": "SEO Uyumlu", "description": "Arama motorlarında üst sıralarda" }], "title": "Neden Biz?" }] }),
        meta_title: 'Web Tasarım Hizmetleri - Demo Vitrin',
        meta_description: 'Modern, responsive ve SEO uyumlu web tasarım hizmetleri.',
        is_active: 1,
        sort_order: 7
    },
    {
        title: 'Mobil Uygulama',
        slug: 'mobil-uygulama',
        content: JSON.stringify({ "sections": [{ "id": "hero-mobil", "type": "hero", "style": { "textColor": "#ffffff", "gradientTo": "#10b981", "useGradient": true, "gradientFrom": "#059669", "gradientDirection": "to-br" }, "title": "Mobil Uygulama", "subtitle": "Cebinizde Güçlü Çözümler", "description": "iOS ve Android için native mobil uygulamalar." }, { "id": "content-mobil", "type": "content", "title": "Mobil Dünyada Yerinizi Alın", "content": "Müşterileriniz her zaman yanınızda olsun." }, { "id": "features-mobil", "type": "features", "items": [{ "icon": "smartphone", "title": "Native Geliştirme", "description": "iOS ve Android için optimize" }, { "icon": "zap", "title": "Yüksek Performans", "description": "Hızlı ve akıcı" }, { "icon": "bell", "title": "Push Bildirimler", "description": "Anında iletişim" }], "title": "Özellikler" }] }),
        meta_title: 'Mobil Uygulama Geliştirme - Demo Vitrin',
        meta_description: 'iOS ve Android için native mobil uygulama geliştirme.',
        is_active: 1,
        sort_order: 8
    },
    {
        title: 'Dijital Pazarlama',
        slug: 'dijital-pazarlama',
        content: JSON.stringify({ "sections": [{ "id": "hero-dijital", "type": "hero", "style": { "textColor": "#ffffff", "gradientTo": "#8b5cf6", "useGradient": true, "gradientFrom": "#7c3aed", "gradientDirection": "to-br" }, "title": "Dijital Pazarlama", "subtitle": "Markanızı Büyütün", "description": "SEO, Google Ads ve sosyal medya yönetimi." }, { "id": "content-dijital", "type": "content", "title": "Dijital Pazarlama Nedir?", "content": "Markanızın online görünürlüğünü artırın." }, { "id": "features-dijital", "type": "features", "items": [{ "icon": "search", "title": "SEO Optimizasyonu", "description": "Arama motorlarında üst sıralarda" }, { "icon": "target", "title": "Google Ads", "description": "Hedefli reklamlar" }, { "icon": "share-2", "title": "Sosyal Medya", "description": "Tüm platformlarda etkili varlık" }], "title": "Hizmetlerimiz" }] }),
        meta_title: 'Dijital Pazarlama Hizmetleri - Demo Vitrin',
        meta_description: 'SEO, Google Ads ve sosyal medya pazarlama hizmetleri.',
        is_active: 1,
        sort_order: 9
    },
    {
        title: 'Grafik Tasarım',
        slug: 'grafik-tasarim',
        content: JSON.stringify({ "sections": [{ "id": "hero-grafik", "type": "hero", "style": { "textColor": "#ffffff", "gradientTo": "#ec4899", "useGradient": true, "gradientFrom": "#db2777", "gradientDirection": "to-br" }, "title": "Grafik Tasarım", "subtitle": "Yaratıcı Tasarımlar", "description": "Logo tasarımı, kurumsal kimlik ve görsel içerikler." }, { "id": "content-grafik", "type": "content", "title": "Görsel İletişimin Gücü", "content": "Güçlü bir görsel kimlik, markanızın ilk izlenimini belirler." }, { "id": "features-grafik", "type": "features", "items": [{ "icon": "pen-tool", "title": "Logo Tasarımı", "description": "Özgün ve akılda kalıcı" }, { "icon": "layout", "title": "Kurumsal Kimlik", "description": "Tutarlı marka kimliği" }, { "icon": "image", "title": "Sosyal Medya Görselleri", "description": "Platformlara özel içerikler" }], "title": "Hizmetlerimiz" }] }),
        meta_title: 'Grafik Tasarım Hizmetleri - Demo Vitrin',
        meta_description: 'Logo, kurumsal kimlik ve görsel tasarım hizmetleri.',
        is_active: 1,
        sort_order: 10
    },
    {
        title: 'Sosyal Medya Yönetimi',
        slug: 'sosyal-medya-yonetimi',
        content: JSON.stringify({ "sections": [{ "id": "hero-sosyal", "type": "hero", "style": { "textColor": "#ffffff", "gradientTo": "#06b6d4", "useGradient": true, "gradientFrom": "#0891b2", "gradientDirection": "to-br" }, "title": "Sosyal Medya Yönetimi", "subtitle": "Sosyal Medyada Güçlü Varlık", "description": "Profesyonel sosyal medya yönetimi ve içerik üretimi." }, { "id": "content-sosyal", "type": "content", "title": "Sosyal Medyanın Önemi", "content": "Sosyal medya, markanızın müşterilerinizle doğrudan iletişim kurduğu en önemli kanaldır." }, { "id": "features-sosyal", "type": "features", "items": [{ "icon": "edit", "title": "İçerik Üretimi", "description": "Özgün ve etkileyici içerik" }, { "icon": "calendar", "title": "İçerik Planlama", "description": "Düzenli paylaşım takvimi" }, { "icon": "message-circle", "title": "Topluluk Yönetimi", "description": "Aktif takipçi etkileşimi" }], "title": "Hizmetlerimiz" }] }),
        meta_title: 'Sosyal Medya Yönetimi - Demo Vitrin',
        meta_description: 'Profesyonel sosyal medya yönetimi ve içerik üretimi hizmetleri.',
        is_active: 1,
        sort_order: 11
    }
];

console.log('🔄 Hizmet sayfaları ekleniyor...\n');

const insert = db.prepare(`
  INSERT OR REPLACE INTO pages (title, slug, content, meta_title, meta_description, is_active, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

let added = 0;
let updated = 0;

for (const page of servicePages) {
    try {
        const existing = db.prepare('SELECT id FROM pages WHERE slug = ?').get(page.slug);

        const result = insert.run(
            page.title,
            page.slug,
            page.content,
            page.meta_title,
            page.meta_description,
            page.is_active,
            page.sort_order
        );

        if (existing) {
            updated++;
            console.log(`✅ Güncellendi: ${page.title} (/${page.slug})`);
        } else {
            added++;
            console.log(`✅ Eklendi: ${page.title} (/${page.slug})`);
        }
    } catch (error) {
        console.error(`❌ Hata (${page.title}):`, error.message);
    }
}

console.log(`\n📊 Özet:`);
console.log(`   Yeni eklenen: ${added}`);
console.log(`   Güncellenen: ${updated}`);
console.log(`   Toplam: ${added + updated}`);

db.close();
console.log('\n✅ İşlem tamamlandı!');
