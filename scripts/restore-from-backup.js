const fs = require('fs');
const path = require('path');

// Yedek dosyasını oku
const backupFile = path.join(__dirname, '..', 'ajans1-backup-2025-10-16.json');
const dataDir = path.join(__dirname, '..', 'data');

console.log('🔄 Yedek dosyasından JSON Storage\'a veri aktarımı başlıyor...');

try {
  // Yedek dosyasını oku
  const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  // Data klasörünü oluştur
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Mevcut data klasörünü temizle
  const existingFiles = fs.readdirSync(dataDir);
  existingFiles.forEach(file => {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(dataDir, file));
    }
  });
  
  console.log('📁 Mevcut JSON dosyaları temizlendi');
  
  // Her tablo için JSON dosyası oluştur
  const tables = backupData.tables;
  let totalRecords = 0;
  
  Object.keys(tables).forEach(tableName => {
    const records = tables[tableName];
    const fileName = `${tableName}.json`;
    const filePath = path.join(dataDir, fileName);
    
    // Veriyi JSON dosyasına yaz
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2));
    
    console.log(`✅ ${tableName}: ${records.length} kayıt aktarıldı`);
    totalRecords += records.length;
  });
  
  console.log(`\n🎉 Başarıyla tamamlandı!`);
  console.log(`📊 Toplam ${Object.keys(tables).length} tablo, ${totalRecords} kayıt aktarıldı`);
  console.log(`📁 Veriler ${dataDir} klasörüne kaydedildi`);
  
  // Önemli tabloları listele
  const importantTables = ['demos', 'pages', 'blog_posts', 'categories', 'menus', 'packages'];
  console.log('\n📋 Önemli tablolar:');
  importantTables.forEach(table => {
    if (tables[table]) {
      console.log(`   ${table}: ${tables[table].length} kayıt`);
    }
  });
  
} catch (error) {
  console.error('❌ Hata:', error.message);
  process.exit(1);
}
