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

// Tüm tabloları listele
async function getAllTables(connection: mysql.Connection) {
  const [tables] = await connection.execute(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = ? 
    ORDER BY TABLE_NAME
  `, [process.env.DB_NAME || 'ajans1']);
  
  return (tables as any[]).map(table => table.TABLE_NAME);
}

// Tablo verilerini al
async function getTableData(connection: mysql.Connection, tableName: string) {
  try {
    const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
    return rows;
  } catch (error) {
    console.warn(`Tablo ${tableName} okunamadı:`, error);
    return [];
  }
}

// Tablo yapısını al
async function getTableStructure(connection: mysql.Connection, tableName: string) {
  try {
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'ajans1', tableName]);
    
    return columns;
  } catch (error) {
    console.warn(`Tablo yapısı ${tableName} okunamadı:`, error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🗂️  Export işlemi başlatılıyor...');
    
    let connection;
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: process.env.DB_NAME || 'ajans1',
        tables: []
      },
      tables: {},
      structures: {}
    };
    
    try {
      // Database bağlantısı
      connection = await getDatabase();
      console.log('✅ Database bağlantısı başarılı');
      
      // Tüm tabloları al
      const tables = await getAllTables(connection);
      console.log(`${tables.length} tablo bulundu`);
      
      backupData.metadata.tables = tables;
      
      // Her tablo için veri ve yapı al
      for (const tableName of tables) {
        console.log(`${tableName} tablosu işleniyor...`);
        
        // Tablo yapısı
        const structure = await getTableStructure(connection, tableName);
        backupData.structures[tableName] = structure;
        
        // Tablo verisi
        const data = await getTableData(connection, tableName);
        backupData.tables[tableName] = data;
        
        console.log(`${data.length} kayıt yedeklendi`);
      }
      
      // JSON string oluştur
      const jsonString = JSON.stringify(backupData, null, 2);
      
      // Response oluştur
      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="ajans1-backup-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
      
    } catch (error) {
      console.error('Database export hatası:', error);
      
      // Mock data döndür
      const mockData = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          type: 'mock_data',
          source: 'fallback'
        },
        tables: {
          menus: [
            { id: '1', name: 'Hakkımızda', url: '/hakkimizda', parent_id: null, sort_order: 0, is_active: 1 },
            { id: '2', name: 'Hizmetlerimiz', url: '/hizmetlerimiz', parent_id: null, sort_order: 1, is_active: 1 },
            { id: '3', name: 'İletişim', url: '/iletisim', parent_id: null, sort_order: 2, is_active: 1 }
          ],
          categories: [
            { id: '1', name: 'Web Sitesi', slug: 'web-sitesi', description: 'Kurumsal web siteleri', icon: '🌐', color: '#3B82F6', is_active: 1, sort_order: 1 },
            { id: '2', name: 'E-Ticaret', slug: 'e-ticaret', description: 'Online satış platformları', icon: '🛒', color: '#F59E0B', is_active: 1, sort_order: 2 }
          ],
          demos: [
            {
              id: '1',
              title: 'Modern E-Ticaret Sitesi',
              description: 'Responsive tasarım ve güvenli ödeme sistemi',
              category: 'E-Ticaret',
              price: 25000,
              demo_url: 'https://demo.example.com',
              is_active: 1,
              images: JSON.stringify(['/placeholder.svg']),
              features: JSON.stringify(['Responsive Tasarım', 'Güvenli Ödeme']),
              technologies: JSON.stringify(['React', 'Next.js']),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          packages: [
            {
              id: '1',
              name: 'Temel Paket',
              description: 'Küçük işletmeler için ideal',
              price: 5000,
              features: JSON.stringify(['5 Sayfa', 'Responsive Tasarım']),
              is_popular: 0,
              is_active: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          pages: [
            {
              id: '1',
              title: 'Hakkımızda',
              slug: 'hakkimizda',
              content: JSON.stringify([
                { type: 'heading', content: 'Hakkımızda', level: 1 },
                { type: 'paragraph', content: 'Modern web teknolojileri ile hizmet veriyoruz.' }
              ]),
              is_active: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        }
      };
      
      const jsonString = JSON.stringify(mockData, null, 2);
      
      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="ajans1-backup-mock-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
      
    } finally {
      if (connection) {
        await connection.end();
      }
    }
    
  } catch (error) {
    console.error('Export hatası:', error);
    return NextResponse.json(
      { error: 'Export işlemi başarısız' },
      { status: 500 }
    );
  }
}
