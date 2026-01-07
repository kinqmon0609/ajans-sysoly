#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Netlify JSON Storage Deployment Başlatılıyor...\n');

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

// 2. JSON Storage'ı başlat
console.log('🗄️  JSON Storage Başlatılıyor...');
try {
  execSync('node scripts/test-json-storage.js', { stdio: 'inherit' });
  console.log('✅ JSON Storage başarıyla başlatıldı\n');
} catch (error) {
  console.error('❌ JSON Storage başlatma hatası:', error.message);
  process.exit(1);
}

// 3. Data klasörünü kontrol et
console.log('📁 Data Klasörü Kontrol Ediliyor...');
const dataDir = path.join(__dirname, '..', 'data');
if (fs.existsSync(dataDir)) {
  const files = fs.readdirSync(dataDir);
  console.log(`✅ Data klasörü mevcut: ${files.length} JSON dosyası`);
  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   - ${file}: ${sizeKB} KB`);
  });
} else {
  console.log('❌ Data klasörü bulunamadı!');
  process.exit(1);
}

// 4. Build test
console.log('\n🔨 Build Test Ediliyor...');
try {
  execSync('USE_JSON_STORAGE=true npm run build', { stdio: 'inherit' });
  console.log('✅ Build başarılı\n');
} catch (error) {
  console.error('❌ Build hatası:', error.message);
  process.exit(1);
}

// 5. Deployment özeti
console.log('📊 Deployment Özeti:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ JSON Storage sistemi hazır');
console.log('✅ Başlangıç verileri yüklendi');
console.log('✅ Build test başarılı');
console.log('✅ Netlify deployment için hazır');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎉 Netlify deployment için her şey hazır!');
console.log('\n📋 Sonraki Adımlar:');
console.log('1. Netlify dashboard\'a gidin');
console.log('2. Environment variables ekleyin:');
console.log('   - USE_JSON_STORAGE=true');
console.log('   - NODE_ENV=production');
console.log('3. Build command: npm run build');
console.log('4. Publish directory: .next');
console.log('5. Deploy butonuna tıklayın');
console.log('\n🔗 Deploy sonrası admin panelinden JSON Storage\'ı kontrol edin:');
console.log('   https://your-site.netlify.app/admin/json-storage');
