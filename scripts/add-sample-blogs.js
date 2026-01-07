const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'ajans1.db');
const db = new Database(dbPath);

const sampleBlogs = [
    {
        title: 'Modern Web Tasarımında 2024 Trendleri',
        slug: 'modern-web-tasariminda-2024-trendleri',
        excerpt: 'Web tasarımında bu yıl öne çıkan trendleri ve nasıl kullanabileceğinizi keşfedin.',
        content: `<h2>Giriş</h2>
<p>2024 yılında web tasarımı alanında birçok yenilik ve trend ortaya çıktı. Bu yazıda, modern web tasarımında dikkat çeken trendleri inceleyeceğiz.</p>

<h2>1. Minimalist Tasarım</h2>
<p>Minimalizm, kullanıcı deneyimini ön plana çıkaran, gereksiz öğelerden arındırılmış tasarım yaklaşımıdır. Temiz, sade ve işlevsel arayüzler kullanıcılar tarafından daha çok tercih ediliyor.</p>

<h2>2. Dark Mode</h2>
<p>Karanlık mod, hem göz sağlığı hem de estetik açıdan kullanıcılar tarafından tercih ediliyor. Modern web siteleri artık dark mode seçeneği sunuyor.</p>

<h2>3. Mikro Animasyonlar</h2>
<p>Küçük, zarif animasyonlar kullanıcı deneyimini zenginleştiriyor ve siteyi daha canlı hale getiriyor.</p>

<h2>Sonuç</h2>
<p>Bu trendleri takip ederek modern ve kullanıcı dostu web siteleri oluşturabilirsiniz.</p>`,
        featured_image: '/images/blog/web-design-trends.jpg',
        category_id: 3,
        status: 'published',
        seo_title: 'Modern Web Tasarımında 2024 Trendleri | Web Tasarım',
        seo_description: 'Web tasarımında 2024 yılında öne çıkan trendleri keşfedin. Minimalizm, dark mode ve mikro animasyonlar hakkında detaylı bilgi.',
        seo_keywords: 'web tasarım, 2024 trendleri, minimalist tasarım, dark mode',
        read_time: 5
    },
    {
        title: 'SEO Optimizasyonu için En İyi Uygulamalar',
        slug: 'seo-optimizasyonu-icin-en-iyi-uygulamalar',
        excerpt: 'Web sitenizin arama motorlarında üst sıralarda yer alması için yapmanız gerekenler.',
        content: `<h2>SEO Nedir?</h2>
<p>SEO (Search Engine Optimization), web sitenizin arama motorlarında daha görünür olmasını sağlayan optimizasyon çalışmalarıdır.</p>

<h2>Temel SEO Uygulamaları</h2>
<h3>1. Anahtar Kelime Araştırması</h3>
<p>Doğru anahtar kelimeleri belirlemek SEO'nun temelidir. Hedef kitlenizin ne aradığını anlamak önemlidir.</p>

<h3>2. Kaliteli İçerik</h3>
<p>Özgün, değerli ve kullanıcı odaklı içerikler oluşturun. Google kaliteli içeriği ödüllendirir.</p>

<h3>3. Teknik SEO</h3>
<p>Site hızı, mobil uyumluluk ve yapılandırılmış veri kullanımı teknik SEO'nun önemli parçalarıdır.</p>

<h2>Sonuç</h2>
<p>SEO sürekli bir çalışma gerektirir. Bu uygulamaları düzenli olarak yaparak sitenizin görünürlüğünü artırabilirsiniz.</p>`,
        featured_image: '/images/blog/seo-optimization.jpg',
        category_id: 1,
        status: 'published',
        seo_title: 'SEO Optimizasyonu İçin En İyi Uygulamalar | Dijital Pazarlama',
        seo_description: 'Web sitenizin arama motorlarında üst sıralarda yer alması için SEO optimizasyonu yapmanız gerekenler.',
        seo_keywords: 'SEO, arama motoru optimizasyonu, dijital pazarlama, anahtar kelime',
        read_time: 7
    },
    {
        title: 'E-Ticaret Sitenizi Nasıl Başarılı Yaparsınız?',
        slug: 'e-ticaret-sitenizi-nasil-basarili-yaparsiniz',
        excerpt: 'E-ticaret sitenizin satışlarını artırmak için uygulamanız gereken stratejiler.',
        content: `<h2>E-Ticaret Başarısının Sırları</h2>
<p>Başarılı bir e-ticaret sitesi oluşturmak sadece ürün satmaktan ibaret değildir. Kullanıcı deneyimi, güvenilirlik ve pazarlama stratejileri de çok önemlidir.</p>

<h2>1. Kullanıcı Dostu Arayüz</h2>
<p>Müşterilerinizin kolayca ürün bulabilmesi ve satın alabilmesi için sezgisel bir arayüz tasarlayın.</p>

<h2>2. Güvenli Ödeme Sistemi</h2>
<p>SSL sertifikası ve güvenilir ödeme yöntemleri kullanarak müşteri güvenini kazanın.</p>

<h2>3. Hızlı Kargo ve İade Politikası</h2>
<p>Hızlı teslimat ve kolay iade süreci müşteri memnuniyetini artırır.</p>

<h2>4. Dijital Pazarlama</h2>
<p>SEO, sosyal medya ve e-posta pazarlama ile sitenize trafik çekin.</p>

<h2>Sonuç</h2>
<p>Bu stratejileri uygulayarak e-ticaret sitenizi başarılı hale getirebilirsiniz.</p>`,
        featured_image: '/images/blog/ecommerce-success.jpg',
        category_id: 1,
        status: 'published',
        seo_title: 'E-Ticaret Sitenizi Nasıl Başarılı Yaparsınız? | E-Ticaret Rehberi',
        seo_description: 'E-ticaret sitenizin satışlarını artırmak için uygulamanız gereken stratejiler ve ipuçları.',
        seo_keywords: 'e-ticaret, online satış, dijital pazarlama, e-ticaret stratejileri',
        read_time: 6
    },
    {
        title: 'React ile Modern Web Uygulamaları Geliştirme',
        slug: 'react-ile-modern-web-uygulamalari-gelistirme',
        excerpt: 'React kullanarak performanslı ve ölçeklenebilir web uygulamaları nasıl geliştirilir?',
        content: `<h2>React Nedir?</h2>
<p>React, Facebook tarafından geliştirilen, kullanıcı arayüzleri oluşturmak için kullanılan popüler bir JavaScript kütüphanesidir.</p>

<h2>React'in Avantajları</h2>
<h3>1. Component Tabanlı Mimari</h3>
<p>Yeniden kullanılabilir bileşenler oluşturarak kod tekrarını azaltın.</p>

<h3>2. Virtual DOM</h3>
<p>Performans optimizasyonu için Virtual DOM kullanır.</p>

<h3>3. Geniş Ekosistem</h3>
<p>React Router, Redux gibi araçlarla güçlü uygulamalar geliştirin.</p>

<h2>Başlangıç İçin İpuçları</h2>
<ul>
<li>JSX syntax'ını öğrenin</li>
<li>State ve Props kavramlarını anlayın</li>
<li>Hooks kullanımını öğrenin</li>
</ul>

<h2>Sonuç</h2>
<p>React, modern web geliştirme için güçlü bir araçtır. Öğrenmesi kolay ve topluluk desteği güçlüdür.</p>`,
        featured_image: '/images/blog/react-development.jpg',
        category_id: 2,
        status: 'published',
        seo_title: 'React ile Modern Web Uygulamaları Geliştirme | Teknoloji',
        seo_description: 'React kullanarak performanslı ve ölçeklenebilir web uygulamaları geliştirme rehberi.',
        seo_keywords: 'React, JavaScript, web geliştirme, frontend, modern web',
        read_time: 8
    },
    {
        title: 'Mobil Uyumlu Web Tasarımının Önemi',
        slug: 'mobil-uyumlu-web-tasariminin-onemi',
        excerpt: 'Neden her web sitesinin mobil uyumlu olması gerekir? Responsive tasarımın faydaları.',
        content: `<h2>Mobil Kullanım İstatistikleri</h2>
<p>İnternet trafiğinin %60'ından fazlası mobil cihazlardan geliyor. Bu nedenle mobil uyumlu tasarım artık bir lüks değil, zorunluluktur.</p>

<h2>Responsive Tasarım Nedir?</h2>
<p>Responsive tasarım, web sitenizin her ekran boyutunda düzgün görünmesini sağlayan tasarım yaklaşımıdır.</p>

<h2>Mobil Uyumluluğun Faydaları</h2>
<h3>1. SEO Avantajı</h3>
<p>Google, mobil uyumlu siteleri arama sonuçlarında daha üst sıralara yerleştirir.</p>

<h3>2. Kullanıcı Deneyimi</h3>
<p>Mobil kullanıcılar için optimize edilmiş siteler daha iyi deneyim sunar.</p>

<h3>3. Dönüşüm Oranı</h3>
<p>Mobil uyumlu siteler daha yüksek dönüşüm oranlarına sahiptir.</p>

<h2>Sonuç</h2>
<p>Mobil uyumlu tasarım günümüzde her web sitesi için olmazsa olmazdır.</p>`,
        featured_image: '/images/blog/mobile-responsive.jpg',
        category_id: 3,
        status: 'published',
        seo_title: 'Mobil Uyumlu Web Tasarımının Önemi | Responsive Tasarım',
        seo_description: 'Mobil uyumlu web tasarımının önemi ve responsive tasarımın faydaları hakkında detaylı bilgi.',
        seo_keywords: 'mobil uyumlu, responsive tasarım, web tasarım, mobil SEO',
        read_time: 5
    }
];

console.log('📝 Blog yazıları ekleniyor...');

const insertStmt = db.prepare(`
  INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image, category_id, 
    status, seo_title, seo_description, seo_keywords, read_time,
    published_at, created_at, updated_at
  ) VALUES (
    @title, @slug, @excerpt, @content, @featured_image, @category_id,
    @status, @seo_title, @seo_description, @seo_keywords, @read_time,
    datetime('now'), datetime('now'), datetime('now')
  )
`);

let added = 0;
for (const blog of sampleBlogs) {
    try {
        insertStmt.run(blog);
        added++;
        console.log(`✅ Eklendi: ${blog.title}`);
    } catch (error) {
        console.log(`⚠️  Zaten var veya hata: ${blog.title}`);
    }
}

console.log(`\n✨ Toplam ${added} blog yazısı eklendi!`);

db.close();
