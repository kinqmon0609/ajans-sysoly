<<<<<<< HEAD
import mysql from 'mysql2/promise';
import { jsonStorage, dbPool as jsonDbPool } from '../json-storage';

// JSON Storage kullan (Netlify için)
const useJsonStorage = process.env.USE_JSON_STORAGE === 'true' || process.env.NODE_ENV === 'production';

// MySQL only configuration
const isSupabase = false;

// MySQL connection configuration (fallback)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '8889'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ajans1',
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Production optimizasyonları
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === 'production' ? 20 : 10,
  queueLimit: 0
};

// Sadece development'ta log göster
if (process.env.NODE_ENV !== 'production') {
  if (isSupabase) {
    console.log('🔧 Supabase Config:', {
      url: process.env.SUPABASE_DATABASE_URL ? 'Set' : 'Missing',
      key: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing'
    });
  } else {
    console.log('🔧 MySQL Config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      password: dbConfig.password ? '***' : 'empty'
    });
  }
}

// MySQL connection pool
let pool: mysql.Pool | null = null;

// Database connection oluştur
function getDatabase() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
      console.log('✅ MySQL database connected');
    } catch (error) {
      console.error('❌ MySQL connection error:', error);
      pool = null;
    }
  }
  return pool;
}

// Mock data for development/fallback
const mockData = {
  menus: [
    { id: '65a650a6-e938-4d8b-ade5-7d65ba2e3476', name: 'Hakkımızda', url: '/hakkimizda', parent_id: null, sort_order: 0, is_active: 1 },
    { id: '6aaf2452-10c9-4f41-bb06-d19d91fe843e', name: 'Hizmetlerimiz', url: '/hizmetlerimiz', parent_id: null, sort_order: 1, is_active: 1 },
    { id: 'c83fdebe-ff5a-409e-9714-0a3dd2ba6115', name: 'E-Ticaret', url: '/e-ticaret', parent_id: null, sort_order: 4, is_active: 1 },
    { id: 'c5d4c38c-d51f-425e-882e-588c78d4eed2', name: 'Web Tasarım', url: '/web-tasarim', parent_id: null, sort_order: 6, is_active: 1 },
    { id: '6d2c0f58-bd2e-4ea3-b974-ed1c7c952b82', name: 'Yazılımlarımız', url: '/demolarimiz', parent_id: null, sort_order: 5, is_active: 1 },
    { id: 'abae90a8-a714-11f0-b978-7df75ef09a30', name: 'Paketlerimiz', url: '/paketlerimiz', parent_id: null, sort_order: 6, is_active: 1 },
    { id: '2597b697-ad3a-4a87-b72e-0dc23b7a1f61', name: 'Blog', url: '/blog', parent_id: null, sort_order: 7, is_active: 1 },
    { id: '52559400-b74b-4253-970a-37820b034e88', name: 'İletişim', url: '/iletisim', parent_id: null, sort_order: 12, is_active: 1 }
  ],
  categories: [
    { id: '11a3fcda-a6b2-11f0-af23-eb6435dcb1e1', name: 'Web Sitesi', slug: 'web-sitesi', description: 'Kurumsal ve e-ticaret web siteleri', icon: '🌐', color: '#3B82F6', is_active: 1, sort_order: 1 },
    { id: '11a419b8-a6b2-11f0-af23-eb6435dcb1e1', name: 'Mobil Uygulama', slug: 'mobil-uygulama', description: 'iOS ve Android mobil uygulamalar', icon: '📱', color: '#10B981', is_active: 1, sort_order: 2 },
    { id: '11a41b20-a6b2-11f0-af23-eb6435dcb1e1', name: 'Özel Yazılım', slug: 'ozel-yazilim', description: 'İşletmelere özel yazılım çözümleri', icon: '⚙️', color: '#8B5CF6', is_active: 1, sort_order: 3 },
    { id: '11a41c88-a6b2-11f0-af23-eb6435dcb1e1', name: 'E-Ticaret', slug: 'e-ticaret', description: 'Online satış platformları', icon: '🛒', color: '#F59E0B', is_active: 1, sort_order: 4 },
    { id: '11a41df0-a6b2-11f0-af23-eb6435dcb1e1', name: 'Kurumsal', slug: 'kurumsal', description: 'Kurumsal web siteleri', icon: '🏢', color: '#EF4444', is_active: 1, sort_order: 5 }
  ],
  demos: [
    {
      id: '900db218-a6f4-11f0-af23-eb6435dcb1e1',
      title: 'Modern E-Ticaret Sitesi',
      description: 'Responsive tasarım, güvenli ödeme sistemi ve admin paneli ile tam özellikli e-ticaret sitesi.',
      category: 'E-Ticaret',
      price: 25000,
      demo_url: 'https://demo1.example.com',
      is_active: 1,
      images: JSON.stringify(['/placeholder.svg', '/placeholder.svg']),
      features: JSON.stringify(['Responsive Tasarım', 'Güvenli Ödeme', 'Admin Panel', 'SEO Optimizasyonu']),
      technologies: JSON.stringify(['React', 'Next.js', 'Node.js', 'MySQL']),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '328aed64-8441-4b23-aae3-0418ef92396e',
      title: 'Kurumsal Web Sitesi',
      description: 'Profesyonel kurumsal kimlik ve modern tasarım ile işletmenizi dijitale taşıyın.',
      category: 'Kurumsal',
      price: 15000,
      demo_url: 'https://demo2.example.com',
      is_active: 1,
      images: JSON.stringify(['/placeholder.svg', '/placeholder.svg']),
      features: JSON.stringify(['Modern Tasarım', 'Hızlı Yükleme', 'SEO Dostu', 'Mobil Uyumlu']),
      technologies: JSON.stringify(['Next.js', 'TypeScript', 'Tailwind CSS']),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  packages: [
    {
      id: 'pkg-1',
      name: 'Temel Paket',
      description: 'Küçük işletmeler için ideal başlangıç paketi',
      price: 5000,
      features: JSON.stringify(['5 Sayfa', 'Responsive Tasarım', 'SEO Temel', '1 Yıl Hosting']),
      is_popular: 0,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pkg-2',
      name: 'Profesyonel Paket',
      description: 'Orta ölçekli işletmeler için kapsamlı çözüm',
      price: 12000,
      features: JSON.stringify(['10 Sayfa', 'Responsive Tasarım', 'SEO Gelişmiş', 'Admin Panel', '2 Yıl Hosting']),
      is_popular: 1,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pkg-3',
      name: 'Premium Paket',
      description: 'Büyük işletmeler için tam özellikli çözüm',
      price: 25000,
      features: JSON.stringify(['Sınırsız Sayfa', 'Responsive Tasarım', 'SEO Premium', 'Admin Panel', 'E-Ticaret', '3 Yıl Hosting']),
      is_popular: 0,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  pages: [
    {
      id: 'page-1',
      title: 'Hakkımızda',
      slug: 'hakkimizda',
      content: JSON.stringify([
        {
          type: 'heading',
          content: 'Hakkımızda',
          level: 1
        },
        {
          type: 'paragraph',
          content: 'Biz, modern web teknolojileri ile işletmenizi dijital dünyada öne çıkaran profesyonel bir ekibiz.'
        }
      ]),
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// MySQL pool wrapper
const dbPool = {
  // Query execution - JSON Storage veya MySQL
=======
import Database from 'better-sqlite3';
import path from 'path';

// SQLite veritabanı bağlantısı
const dbPath = path.join(process.cwd(), 'ajans1.db');
const db = new Database(dbPath);

// WAL mode for better performance
db.pragma('journal_mode = WAL');

console.log('✅ SQLite database connected:', dbPath);

// Pool interface for compatibility with existing queries
const pool = {
>>>>>>> e25526c
  execute: async (sql: string, params: any[] = []) => {
    // JSON Storage kullanılıyorsa
    if (useJsonStorage) {
      console.log('Using JSON Storage for query:', sql.substring(0, 50) + '...');
      return await jsonDbPool.execute(sql, params);
    }
    
    try {
<<<<<<< HEAD
      const database = getDatabase();
      
      if (database) {
        console.log('Using MySQL for query:', sql.substring(0, 50) + '...');
        
        // SQLite syntax'ını MySQL'e çevir
        let mysqlQuery = sql
          .replace(/datetime\('now'\)/g, 'NOW()')
          .replace(/datetime\('now',\s*'([^']+)'\)/g, (match, interval) => {
            // SQLite formatını MySQL formatına çevir
            if (interval.includes('-')) {
              const parts = interval.split(' ');
              const amount = parts[0].replace('-', '');
              const unit = parts[1] || 'MINUTE';
              return `DATE_SUB(NOW(), INTERVAL ${amount} ${unit.toUpperCase()})`;
            }
            return `DATE_SUB(NOW(), INTERVAL ${interval})`;
          })
          .replace(/AUTOINCREMENT/g, 'AUTO_INCREMENT')
          .replace(/INTEGER/g, 'INT')
          .replace(/TEXT/g, 'VARCHAR(255)')
          .replace(/REAL/g, 'FLOAT');
        
        // INSERT OR REPLACE'i MySQL syntax'ına çevir
        if (mysqlQuery.includes('INSERT OR REPLACE INTO')) {
          const match = mysqlQuery.match(/INSERT OR REPLACE INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
          if (match) {
            const [, table, columns, values] = match;
            const columnList = columns.split(',').map(col => col.trim());
            const updateClause = columnList.map(col => `${col} = VALUES(${col})`).join(', ');
            mysqlQuery = `INSERT INTO ${table} (${columns}) VALUES (${values}) ON DUPLICATE KEY UPDATE ${updateClause}`;
          }
        }
        
        const [rows, fields] = await database.execute(mysqlQuery, params);
        
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          return [rows];
        } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
          return [{ insertId: (rows as any).insertId, affectedRows: (rows as any).affectedRows }];
        } else if (sql.trim().toUpperCase().startsWith('UPDATE') || sql.trim().toUpperCase().startsWith('DELETE')) {
          return [{ affectedRows: (rows as any).affectedRows }];
        } else {
          return [{ success: true }];
        }
      } else {
        console.log('MySQL not available, using JSON Storage fallback for query:', sql.substring(0, 50) + '...');
        return await jsonDbPool.execute(sql, params);
=======
      // SELECT queries
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = db.prepare(sql);
        const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
        return [rows];
>>>>>>> e25526c
      }

      // INSERT, UPDATE, DELETE queries
      const stmt = db.prepare(sql);
      const result = params.length > 0 ? stmt.run(...params) : stmt.run();
      return [result];
    } catch (error) {
<<<<<<< HEAD
      console.error('Query execution error:', error);
      // Hata durumunda JSON Storage'a fallback
      console.log('Falling back to JSON Storage...');
      return await jsonDbPool.execute(sql, params);
    }
  },

  // Transaction support
  transaction: async (queries: Array<{ sql: string; params?: any[] }>) => {
    const database = getDatabase();
    if (!database) {
      // MySQL yoksa mock data döndür
      return queries.map(() => []);
    }

    const connection = await database.getConnection();
    try {
      await connection.beginTransaction();
      
      const results = [];
      for (const query of queries) {
        const [rows] = await connection.execute(query.sql, query.params || []);
        results.push(rows);
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

// Mock data döndürme fonksiyonu
function getMockData(sql: string): any[] {
  const upperSql = sql.toUpperCase();
  
  if (upperSql.includes('FROM menus') || upperSql.includes('FROM menu_items')) {
    return mockData.menus;
  } else if (upperSql.includes('FROM categories')) {
    return mockData.categories;
  } else if (upperSql.includes('FROM demos')) {
    return mockData.demos;
  } else if (upperSql.includes('FROM packages')) {
    return mockData.packages;
  } else if (upperSql.includes('FROM pages')) {
    return mockData.pages;
  } else if (upperSql.includes('FROM notifications')) {
    return [];
  } else if (upperSql.includes('FROM analytics') || upperSql.includes('FROM page_views') || upperSql.includes('FROM active_visitors')) {
    return [{ count: 0 }];
  }
  
  return [];
}

// Hem default hem named export
export { pool, getDatabase };
export default dbPool;
=======
      console.error('SQLite query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }
};

export { pool };
export default pool;
>>>>>>> e25526c
