# Ajans1 - Netlify JSON Storage Sistemi

Modern web ajansı için geliştirilmiş Next.js tabanlı CMS sistemi. JSON Storage ile serverless deployment desteği.

## 🚀 Özellikler

- **JSON Storage**: MySQL yerine JSON dosyaları ile veri saklama
- **Serverless Ready**: Netlify, Vercel gibi platformlarda çalışır
- **Admin Panel**: Tam özellikli içerik yönetim sistemi
- **Responsive Design**: Mobil uyumlu modern tasarım
- **SEO Optimized**: Arama motoru optimizasyonu
- **Analytics**: Google Analytics entegrasyonu

## 📁 Proje Yapısı

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel sayfaları
│   ├── api/               # API routes
│   └── (pages)/           # Public sayfalar
├── components/            # React bileşenleri
├── lib/                   # Utility fonksiyonları
│   ├── json-storage/      # JSON Storage sistemi
│   └── mysql/             # MySQL client (fallback)
├── data/                  # JSON veri dosyaları
└── scripts/               # Build ve deployment scriptleri
```

## 🛠️ Netlify Deployment

### Otomatik Deployment

Bu proje Netlify'da otomatik olarak deploy edilir:

1. **GitHub'a push** yapıldığında otomatik build başlar
2. **JSON Storage** otomatik olarak initialize edilir
3. **Environment variables** otomatik ayarlanır

### Manuel Deployment

1. **Netlify Dashboard'a gidin**
2. **New site from Git** seçin
3. **GitHub repository'yi bağlayın**
4. **Build settings:**
   - Build command: `npm run build:netlify`
   - Publish directory: `.next`
5. **Environment variables:**
   - `USE_JSON_STORAGE=true`
   - `NODE_ENV=production`

## 🔧 JSON Storage Sistemi

Bu proje JSON Storage sistemi kullanır. Veriler `data/` klasöründe JSON dosyaları olarak saklanır.

### Avantajlar
- **Serverless Uyumlu**: MySQL gerektirmez
- **Hızlı**: Dosya tabanlı veri erişimi
- **Basit**: Karmaşık veritabanı kurulumu yok
- **Portable**: Kolay backup ve restore

### Veri Yapısı
- `demos.json` - Demo projeler
- `pages.json` - Sayfa içerikleri
- `menus.json` - Menü yapısı
- `blog.json` - Blog yazıları
- `categories.json` - Kategoriler

## 📦 Build Scripts

- `npm run build:netlify` - Netlify için build
- `npm run deploy:netlify` - Netlify deployment test
- `npm run json:init` - JSON Storage başlat
- `npm run json:reset` - JSON Storage sıfırla

## 🎯 Kullanım

### Admin Panel
- `/admin` - Admin paneli
- `/admin/demos` - Demo yönetimi
- `/admin/pages` - Sayfa yönetimi
- `/admin/json-storage` - JSON Storage durumu

### Public Sayfalar
- `/` - Ana sayfa
- `/demolarimiz` - Demo listesi
- `/blog` - Blog
- `/hakkimizda` - Hakkımızda

## 🔄 Veri Yönetimi

### Backup
```bash
npm run json:backup
```

### Restore
```bash
npm run json:restore
```

### Reset
```bash
npm run json:reset
```

## 📝 Environment Variables

### Netlify
- `USE_JSON_STORAGE=true` - JSON Storage aktif
- `NODE_ENV=production` - Production modu

### Local Development
- `USE_JSON_STORAGE=true` - JSON Storage aktif
- `NODE_ENV=development` - Development modu

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Email**: info@example.com
- **Website**: https://example.com
- **GitHub**: https://github.com/kinqmon/portfolio-sysoly