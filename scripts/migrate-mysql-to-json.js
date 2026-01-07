#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// MySQL bağlantı ayarları
const mysqlConfig = {
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'ajans1'
};

// JSON dosya yolları
const DATA_DIR = path.join(__dirname, '..', 'data');
const TABLES = {
  menus: 'menus.json',
  pages: 'pages.json',
  blog: 'blog.json',
  categories: 'categories.json',
  demos: 'demos.json',
  packages: 'packages.json',
  notifications: 'notifications.json',
  contacts: 'contacts.json',
  quote_requests: 'quote_requests.json',
  newsletter: 'newsletter.json',
  users: 'users.json',
  settings: 'settings.json',
  testimonials: 'testimonials.json',
  popups: 'popups.json',
  faqs: 'faqs.json'
};

// Data klasörünü oluştur
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('📁 Data klasörü oluşturuldu:', DATA_DIR);
  }
}

// JSON dosyasına yaz
function writeJsonFile(tableName, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, TABLES[tableName]);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ ${tableName} dosyası yazıldı: ${data.length} kayıt`);
  } catch (error) {
    console.error(`❌ Error writing ${tableName}:`, error);
    throw error;
  }
}

// ID oluştur
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Veri dönüştürme fonksiyonları
function transformRecord(record, tableName) {
  const transformed = { ...record };
  
  // ID'yi dönüştür
  if (transformed.id && typeof transformed.id === 'number') {
    transformed.id = transformed.id.toString();
  } else if (!transformed.id) {
    transformed.id = generateId();
  }
  
  // Boolean değerleri dönüştür
  if (transformed.is_active !== undefined) {
    transformed.is_active = Boolean(transformed.is_active);
  }
  if (transformed.is_popular !== undefined) {
    transformed.is_popular = Boolean(transformed.is_popular);
  }
  if (transformed.featured !== undefined) {
    transformed.featured = Boolean(transformed.featured);
  }
  
  // JSON string'leri parse et
  if (transformed.content && typeof transformed.content === 'string') {
    try {
      transformed.content = JSON.parse(transformed.content);
    } catch (e) {
      // JSON değilse olduğu gibi bırak
    }
  }
  
  if (transformed.images && typeof transformed.images === 'string') {
    try {
      transformed.images = JSON.parse(transformed.images);
    } catch (e) {
      // JSON değilse array yap
      transformed.images = [transformed.images];
    }
  }
  
  if (transformed.features && typeof transformed.features === 'string') {
    try {
      transformed.features = JSON.parse(transformed.features);
    } catch (e) {
      // JSON değilse array yap
      transformed.features = [transformed.features];
    }
  }
  
  if (transformed.technologies && typeof transformed.technologies === 'string') {
    try {
      transformed.technologies = JSON.parse(transformed.technologies);
    } catch (e) {
      // JSON değilse array yap
      transformed.technologies = [transformed.technologies];
    }
  }
  
  // Timestamp'leri ISO string'e çevir
  if (transformed.created_at) {
    transformed.created_at = new Date(transformed.created_at).toISOString();
  } else {
    transformed.created_at = new Date().toISOString();
  }
  
  if (transformed.updated_at) {
    transformed.updated_at = new Date(transformed.updated_at).toISOString();
  } else {
    transformed.updated_at = new Date().toISOString();
  }
  
  return transformed;
}

// Ana migration fonksiyonu
async function migrateMySQLToJSON() {
  console.log('🚀 MySQL\'den JSON\'a veri migration başlatılıyor...\n');
  
  let connection;
  
  try {
    // MySQL'e bağlan
    console.log('🔌 MySQL\'e bağlanıyor...');
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL bağlantısı başarılı!\n');
    
    let totalMigrated = 0;
    
    // Her tablo için migration
    for (const [tableName, fileName] of Object.entries(TABLES)) {
      try {
        console.log(`📋 ${tableName} tablosu işleniyor...`);
        
        // MySQL'den veriyi al
        const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
        
        if (rows.length === 0) {
          console.log(`⏭️  ${tableName}: Veri yok, boş array oluşturuluyor`);
          writeJsonFile(tableName, []);
          continue;
        }
        
        // Verileri dönüştür
        const transformedData = rows.map(record => transformRecord(record, tableName));
        
        // JSON dosyasına yaz
        writeJsonFile(tableName, transformedData);
        
        totalMigrated += transformedData.length;
        console.log(`✅ ${tableName}: ${transformedData.length} kayıt migrate edildi\n`);
        
      } catch (error) {
        console.log(`❌ ${tableName} hatası:`, error.message);
        
        // Hata durumunda boş array oluştur
        writeJsonFile(tableName, []);
        console.log(`📝 ${tableName}: Boş array oluşturuldu\n`);
      }
    }
    
    console.log('════════════════════════════════════════');
    console.log(`🎉 Migration tamamlandı!`);
    console.log(`📊 Toplam ${totalMigrated} kayıt migrate edildi`);
    console.log('════════════════════════════════════════\n');
    
    // Migration özeti
    console.log('📋 Migration Özeti:');
    for (const tableName of Object.keys(TABLES)) {
      const filePath = path.join(DATA_DIR, TABLES[tableName]);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`   ${tableName}: ${data.length} kayıt`);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration hatası:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 MySQL bağlantısı kapatıldı');
    }
  }
}

// Script çalıştır
if (require.main === module) {
  migrateMySQLToJSON().catch(console.error);
}

module.exports = { migrateMySQLToJSON };
