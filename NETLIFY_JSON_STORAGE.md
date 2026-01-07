# 🚀 Netlify JSON Storage Deployment Rehberi

## 📋 Özet

Bu rehber, Ajans1 projesini Netlify'da JSON tabanlı veri saklama sistemi ile deploy etmek için gerekli adımları içerir.

## 🔧 Netlify Environment Variables

Netlify dashboard'da aşağıdaki environment variable'ları ekleyin:

### Zorunlu Değişkenler
```
USE_JSON_STORAGE=true
NODE_ENV=production
```

### Opsiyonel Değişkenler
```
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## 📁 JSON Veri Dosyaları

Sistem otomatik olarak `data/` klasöründe aşağıdaki JSON dosyalarını oluşturur:

- `menus.json` - Menü öğeleri
- `pages.json` - Sayfa içerikleri
- `blog.json` - Blog yazıları
- `categories.json` - Kategoriler
- `demos.json` - Demo projeler
- `packages.json` - Paketler
- `notifications.json` - Bildirimler
- `contacts.json` - İletişim formları
- `quote_requests.json` - Teklif talepleri
- `newsletter.json` - Newsletter aboneleri
- `users.json` - Kullanıcılar
- `settings.json` - Site ayarları

## 🚀 Deployment Adımları

### 1. Netlify'da Yeni Site Oluştur
1. Netlify dashboard'a gidin
2. "New site from Git" seçin
3. GitHub repository'nizi bağlayın

### 2. Build Ayarları
```
Build command: npm run build
Publish directory: .next
```

### 3. Environment Variables Ekle
Netlify dashboard > Site settings > Environment variables:
```
USE_JSON_STORAGE=true
NODE_ENV=production
```

### 4. Deploy
1. "Deploy site" butonuna tıklayın
2. Build işleminin tamamlanmasını bekleyin

## 🔄 JSON Storage Başlatma

Deploy sonrası admin panelinden JSON Storage'ı başlatın:

1. `https://your-site.netlify.app/admin/json-storage` adresine gidin
2. "JSON Storage Başlat" butonuna tıklayın
3. Başlangıç verileri otomatik olarak yüklenecek

## 📊 Admin Panel Özellikleri

### JSON Storage Yönetimi
- **Genel Bakış**: Tablo sayısı, kayıt sayısı, sistem durumu
- **Tablolar**: Her tablo için detaylı bilgi
- **İşlemler**: 
  - JSON Storage başlatma
  - Veri yedekleme
  - Veri geri yükleme
  - Storage sıfırlama

### Veri Yönetimi
- Tüm CRUD işlemleri JSON dosyalarında
- Otomatik ID oluşturma
- Timestamp yönetimi
- Sayfalama desteği

## 🔧 Geliştirme vs Production

### Geliştirme Ortamı
```bash
# MySQL kullanımı (varsayılan)
npm run dev
```

### Production Ortamı (Netlify)
```bash
# JSON Storage kullanımı
USE_JSON_STORAGE=true npm run build
```

## 📈 Performans Optimizasyonları

### JSON Storage Avantajları
- ✅ Hızlı okuma/yazma
- ✅ Dosya tabanlı (Git ile versioning)
- ✅ Netlify ile uyumlu
- ✅ Backup/restore kolaylığı
- ✅ Geliştirme dostu

### Öneriler
- Büyük veri setleri için sayfalama kullanın
- Düzenli backup alın
- JSON dosyalarını Git'e commit edin

## 🛠️ Sorun Giderme

### JSON Storage Başlatılamıyor
1. Environment variable'ları kontrol edin
2. Admin panelinden manuel başlatma yapın
3. Console loglarını inceleyin

### Veri Kaybolması
1. Backup dosyasından geri yükleyin
2. Git history'den önceki versiyonu alın
3. JSON Storage'ı sıfırlayıp yeniden başlatın

### Performance Sorunları
1. Büyük JSON dosyalarını bölün
2. Sayfalama kullanın
3. Cache mekanizmalarını aktifleştirin

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Admin panelindeki sistem durumunu inceleyin
3. JSON dosyalarının varlığını kontrol edin

---

**Not**: Bu sistem Netlify'ın serverless yapısına uygun olarak tasarlanmıştır. Veriler dosya sisteminde saklanır ve her deployment'ta korunur.
