#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Netlify JSON Storage Build Başlatılıyor...\n');

// 1. Environment variables kontrol et
console.log('📋 Environment Variables Kontrol Ediliyor...');
const requiredEnvVars = ['USE_JSON_STORAGE'];
const missingVars = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('⚠️  Eksik environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n💡 Netlify dashboard\'da şu değişkenleri ekleyin:');
  console.log('   USE_JSON_STORAGE=true');
  console.log('   NODE_ENV=production\n');
} else {
  console.log('✅ Tüm environment variables mevcut\n');
}

// 2. NPM cache temizle ve dependencies yükle
console.log('🧹 NPM cache temizleniyor...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ NPM cache temizlendi');
} catch (error) {
  console.log('⚠️  NPM cache temizleme hatası (devam ediliyor):', error.message);
}

console.log('📦 Dependencies yükleniyor...');
try {
  execSync('npm install --legacy-peer-deps --force --no-audit --no-fund', { stdio: 'inherit' });
  console.log('✅ Dependencies başarıyla yüklendi');
} catch (error) {
  console.error('❌ Dependency yükleme hatası:', error.message);
  process.exit(1);
}

// TailwindCSS native binding sorunu için
console.log('🎨 TailwindCSS native binding devre dışı bırakılıyor...');
try {
  // TailwindCSS v3 kullanımını zorla
  execSync('npm install tailwindcss@^3.4.15 --legacy-peer-deps --force', { stdio: 'inherit' });
  console.log('✅ TailwindCSS v3 yüklendi\n');
} catch (error) {
  console.log('⚠️  TailwindCSS yükleme hatası (devam ediliyor):', error.message);
}

// 3. JSON Storage'ı başlat
console.log('🗄️  JSON Storage Başlatılıyor...');
try {
  // Data klasörünü oluştur
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Data klasörü oluşturuldu');
  }

  // JSON Storage'ı initialize et
  execSync('node scripts/test-json-storage.js', { stdio: 'inherit' });
  console.log('✅ JSON Storage başlatıldı\n');
} catch (error) {
  console.error('❌ JSON Storage başlatma hatası:', error.message);
  process.exit(1);
}

// 4. Build işlemi
console.log('🔨 Next.js Build Başlatılıyor...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build başarılı\n');
} catch (error) {
  console.error('❌ Build hatası:', error.message);
  process.exit(1);
}

// 4. Build sonuçlarını kontrol et
console.log('📊 Build Sonuçları:');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('✅ .next klasörü oluşturuldu');
  
  // Sayfa sayısını kontrol et
  const pagesDir = path.join(nextDir, 'server', 'app');
  if (fs.existsSync(pagesDir)) {
    const pages = fs.readdirSync(pagesDir, { recursive: true })
      .filter(file => file.endsWith('.js') && !file.includes('_'));
    console.log(`✅ ${pages.length} sayfa oluşturuldu`);
  }
} else {
  console.log('❌ .next klasörü bulunamadı');
  process.exit(1);
}

console.log('\n🎉 Netlify Build Başarıyla Tamamlandı!');
console.log('📁 Publish directory: .next');
console.log('🌐 Site hazır!');