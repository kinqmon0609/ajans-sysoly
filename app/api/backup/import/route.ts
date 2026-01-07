import { NextRequest, NextResponse } from 'next/server';

import mysql from 'mysql2/promise';

// Database connection
async function getDatabase() {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ajans1',
    charset: 'utf8mb4'
  });
}

// Tablo oluştur
async function createTable(connection: mysql.Connection, tableName: string, structure: any[]) {
  try {
    // Tablo var mı kontrol et
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `, [process.env.DB_NAME || 'ajans1', tableName]);
    
    if ((tables as any[]).length > 0) {
      console.log(`${tableName} tablosu zaten mevcut, atlanıyor`);
      return;
    }
    
    // Tablo oluştur
    const columns = structure.map((col: any) => {
      let columnDef = `\`${col.COLUMN_NAME}\` ${col.DATA_TYPE}`;
      
      if (col.IS_NULLABLE === 'NO') {
        columnDef += ' NOT NULL';
      }
      
      if (col.COLUMN_DEFAULT !== null) {
        columnDef += ` DEFAULT '${col.COLUMN_DEFAULT}'`;
      }
      
      if (col.EXTRA.includes('auto_increment')) {
        columnDef += ' AUTO_INCREMENT';
      }
      
      if (col.COLUMN_KEY === 'PRI') {
        columnDef += ' PRIMARY KEY';
      }
      
      return columnDef;
    }).join(', ');
    
    const createSQL = `CREATE TABLE \`${tableName}\` (${columns})`;
    await connection.execute(createSQL);
    
    console.log(`${tableName} tablosu oluşturuldu`);
    
  } catch (error) {
    console.error(`${tableName} tablosu oluşturulamadı:`, error);
    throw error;
  }
}

// Veri ekle
async function insertData(connection: mysql.Connection, tableName: string, data: any[]) {
  if (!data || data.length === 0) {
    console.log(`${tableName} tablosu için veri yok`);
    return;
  }
  
  try {
    // Mevcut verileri temizle
    await connection.execute(`DELETE FROM \`${tableName}\``);
    console.log(`${tableName} tablosu temizlendi`);
    
    // Yeni verileri ekle
    for (const row of data) {
      const columns = Object.keys(row);
      const values = Object.values(row);
      const placeholders = columns.map(() => '?').join(', ');
      
      const insertSQL = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;
      await connection.execute(insertSQL, values);
    }
    
    console.log(`${tableName} tablosuna ${data.length} kayıt eklendi`);
    
  } catch (error) {
    console.error(`${tableName} tablosuna veri eklenemedi:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Import işlemi başlatılıyor...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }
    
    // Dosyayı oku
    const fileContent = await file.text();
    let backupData;
    
    try {
      backupData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: 'Geçersiz JSON dosyası' },
        { status: 400 }
      );
    }
    
    console.log(`Yedek bilgileri: ${backupData.metadata.tables.length} tablo`);
    
    let connection;
    let totalImportedRecords = 0;
    
    try {
      // Database bağlantısı
      connection = await getDatabase();
      console.log('Database bağlantısı başarılı');
      
      // Her tablo için işlem yap
      for (const tableName of backupData.metadata.tables) {
        console.log(`${tableName} tablosu işleniyor...`);
        
        // Tablo yapısı varsa oluştur
        if (backupData.structures && backupData.structures[tableName]) {
          await createTable(connection, tableName, backupData.structures[tableName]);
        }
        
        // Verileri ekle
        if (backupData.tables && backupData.tables[tableName]) {
          await insertData(connection, tableName, backupData.tables[tableName]);
          totalImportedRecords += backupData.tables[tableName].length;
        }
      }
      
      console.log(`Import tamamlandı: ${totalImportedRecords} kayıt`);
      
      return NextResponse.json({
        success: true,
        message: 'Import işlemi başarılı',
        importedRecords: totalImportedRecords,
        importedTables: backupData.metadata.tables.length
      });
      
    } catch (error) {
      console.error('Import hatası:', error);
      return NextResponse.json(
        { error: 'Import işlemi başarısız: ' + (error as Error).message },
        { status: 500 }
      );
    } finally {
      if (connection) {
        await connection.end();
      }
    }
    
  } catch (error) {
    console.error('Import hatası:', error);
    return NextResponse.json(
      { error: 'Import işlemi başarısız' },
      { status: 500 }
    );
  }
}
