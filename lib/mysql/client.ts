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
  execute: async (sql: string, params: any[] = []) => {
    // JSON Storage kullanılıyorsa
    if (useJsonStorage) {
      console.log('Using JSON Storage for query:', sql.substring(0, 50) + '...');
      return await jsonDbPool.execute(sql, params);
    }
    
    try {
      // SELECT queries
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = db.prepare(sql);
        const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
        return [rows];
      }

      // INSERT, UPDATE, DELETE queries
      const stmt = db.prepare(sql);
      const result = params.length > 0 ? stmt.run(...params) : stmt.run();
      return [result];
    } catch (error) {
      console.error('SQLite query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }
};

export { pool };
export default pool;
