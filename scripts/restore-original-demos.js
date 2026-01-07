const mysql = require('mysql2/promise');

async function restoreDemos() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'ajans1_db',
    charset: 'utf8mb4',
  });

  try {
    console.log('📋 Mevcut demolar kontrol ediliyor...');
    const [rows] = await connection.execute('SELECT id, title FROM demos');
    
    if (rows.length > 0) {
      console.log('✅ Demolar veritabanında mevcut:');
      rows.forEach((row) => {
        console.log(`  - ${row.title}`);
      });
      console.log('\n💡 Demolar kaybolmadı, sadece çok büyük resim verisi MySQL hafızasını aşmış.');
      console.log('💡 Şimdi bu demoları küçük resimlerle güncelleyin veya resim URL\'leri kullanın.');
    } else {
      console.log('❌ Demolar bulunamadı.');
    }
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await connection.end();
  }
}

restoreDemos();





