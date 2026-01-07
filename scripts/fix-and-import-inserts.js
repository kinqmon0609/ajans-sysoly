const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_HkAZ7bCmL3Pl@ep-steep-butterfly-adba2scv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixAndImportInserts() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Neon DB\'ye bağlanıyor...');
    await client.connect();
    console.log('✅ Bağlandı!');
    console.log('');

    const sqlPath = path.join(__dirname, '..', 'ajans1_db.sql');
    console.log('📖 Orijinal MySQL dump okunuyor...');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔧 INSERT komutları ayıklanıyor...');
    
    // INSERT INTO komutlarını bul
    const insertRegex = /INSERT INTO `(\w+)`[^;]+;/gi;
    const inserts = sql.match(insertRegex) || [];
    
    console.log(`📊 ${inserts.length} INSERT komutu bulundu`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;
    const failedTables = new Set();

    for (let i = 0; i < inserts.length; i++) {
      let insert = inserts[i];
      
      // Backtick'leri kaldır
      insert = insert.replace(/`/g, '"');
      
      // ? placeholder'ları değiştirme (PostgreSQL VALUES içinde kullanmıyor)
      
      try {
        await client.query(insert);
        successCount++;
        
        if (successCount % 5 === 0) {
          console.log(`✓ ${successCount}/${inserts.length} veri eklendi...`);
        }
      } catch (error) {
        errorCount++;
        const tableName = insert.match(/INSERT INTO "?(\w+)"?/i)?.[1];
        failedTables.add(tableName);
        
        if (errorCount <= 3) {
          console.log(`⚠ ${tableName}: ${error.message.substring(0, 50)}`);
        }
      }
    }

    console.log('');
    console.log('════════════════════════════════════════');
    console.log('📊 VERİ İMPORT ÖZETİ:');
    console.log('════════════════════════════════════════');
    console.log(`   ✅ Başarılı: ${successCount}/${inserts.length}`);
    console.log(`   ❌ Hatalı: ${errorCount}`);
    
    if (failedTables.size > 0) {
      console.log(`   ⚠️  Sorunlu tablolar: ${Array.from(failedTables).join(', ')}`);
    }
    
    console.log('');
    
    if (successCount > 0) {
      console.log('🎉 Veriler Neon DB\'ye eklendi!');
      console.log('');
      console.log('🚀 Şimdi uygulamayı başlatabilirsiniz:');
      console.log('   npm run dev');
    }

  } catch (error) {
    console.error('💥 Kritik hata:', error.message);
  } finally {
    await client.end();
    console.log('');
    console.log('🔌 Bağlantı kapatıldı.');
  }
}

fixAndImportInserts();


