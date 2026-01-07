import fs from 'fs';
import path from 'path';

// JSON dosya yolları
const DATA_DIR = path.join(process.cwd(), 'data');
const TABLES = {
  menus: 'menus.json',
  menu_items: 'menu_items.json',
  pages: 'pages.json',
  blog: 'blog.json',
  blog_posts: 'blog_posts.json',
  blog_categories: 'blog_categories.json',
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
  faqs: 'faqs.json',
  page_views: 'page_views.json',
  active_visitors: 'active_visitors.json',
  analytics: 'analytics.json'
} as const;

// Data klasörünü oluştur
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// JSON dosyasını oku
function readJsonFile<T>(tableName: keyof typeof TABLES): T[] {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, TABLES[tableName]);
  
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${tableName}:`, error);
    return [];
  }
}

// JSON dosyasına yaz
function writeJsonFile<T>(tableName: keyof typeof TABLES, data: T[]): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, TABLES[tableName]);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${tableName}:`, error);
    throw error;
  }
}

// ID oluştur
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// JSON Storage Client
export class JsonStorageClient {
  // Tüm kayıtları getir
  async getAll<T>(tableName: keyof typeof TABLES): Promise<T[]> {
    return readJsonFile<T>(tableName);
  }

  // ID ile kayıt getir
  async getById<T>(tableName: keyof typeof TABLES, id: string): Promise<T | null> {
    const data = readJsonFile<T>(tableName);
    return data.find((item: any) => item.id === id) || null;
  }

  // Koşula göre kayıtları getir
  async getWhere<T>(tableName: keyof typeof TABLES, condition: (item: T) => boolean): Promise<T[]> {
    const data = readJsonFile<T>(tableName);
    return data.filter(condition);
  }

  // Yeni kayıt ekle
  async create<T extends { id?: string }>(tableName: keyof typeof TABLES, item: Omit<T, 'id'>): Promise<T> {
    const data = readJsonFile<T>(tableName);
    const newItem = {
      ...item,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as T;
    
    data.push(newItem);
    writeJsonFile(tableName, data);
    return newItem;
  }

  // Kayıt güncelle
  async update<T extends { id: string }>(tableName: keyof typeof TABLES, id: string, updates: Partial<T>): Promise<T | null> {
    const data = readJsonFile<T>(tableName);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    data[index] = {
      ...data[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    writeJsonFile(tableName, data);
    return data[index];
  }

  // Kayıt sil
  async delete(tableName: keyof typeof TABLES, id: string): Promise<boolean> {
    const data = readJsonFile(tableName);
    const index = data.findIndex((item: any) => item.id === id);
    
    if (index === -1) {
      return false;
    }
    
    data.splice(index, 1);
    writeJsonFile(tableName, data);
    return true;
  }

  // Sayfalama ile getir
  async getPaginated<T>(
    tableName: keyof typeof TABLES, 
    page: number = 1, 
    limit: number = 10,
    condition?: (item: T) => boolean
  ): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    let data = readJsonFile<T>(tableName);
    
    if (condition) {
      data = data.filter(condition);
    }
    
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedData = data.slice(offset, offset + limit);
    
    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages
    };
  }

  // Arama yap
  async search<T>(
    tableName: keyof typeof TABLES,
    searchTerm: string,
    fields: (keyof T)[]
  ): Promise<T[]> {
    const data = readJsonFile<T>(tableName);
    const term = searchTerm.toLowerCase();
    
    return data.filter(item => {
      return fields.some(field => {
        const value = (item as any)[field];
        return value && value.toString().toLowerCase().includes(term);
      });
    });
  }

  // Toplu işlemler
  async bulkCreate<T extends { id?: string }>(tableName: keyof typeof TABLES, items: Omit<T, 'id'>[]): Promise<T[]> {
    const data = readJsonFile<T>(tableName);
    const newItems = items.map(item => ({
      ...item,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) as T[];
    
    data.push(...newItems);
    writeJsonFile(tableName, data);
    return newItems;
  }

  // Tablo sıfırla
  async truncate(tableName: keyof typeof TABLES): Promise<void> {
    writeJsonFile(tableName, []);
  }

  // Tablo yedekle
  async backup(tableName: keyof typeof TABLES): Promise<any[]> {
    return readJsonFile(tableName);
  }

  // Tablo geri yükle
  async restore(tableName: keyof typeof TABLES, data: any[]): Promise<void> {
    writeJsonFile(tableName, data);
  }
}

// Singleton instance
export const jsonStorage = new JsonStorageClient();

// MySQL benzeri interface için wrapper
export const dbPool = {
  async execute(sql: string, params: any[] = []): Promise<any[]> {
    // SQL'i parse et ve JSON storage'a çevir
    const upperSql = sql.toUpperCase().trim();
    
    if (upperSql.startsWith('SELECT')) {
      return this.handleSelect(sql, params);
    } else if (upperSql.startsWith('INSERT')) {
      return this.handleInsert(sql, params);
    } else if (upperSql.startsWith('UPDATE')) {
      return this.handleUpdate(sql, params);
    } else if (upperSql.startsWith('DELETE')) {
      return this.handleDelete(sql, params);
    }
    
    return [];
  },

  async handleSelect(sql: string, params: any[]): Promise<any[]> {
    // SELECT parsing
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (!tableMatch) return [];
    
    const tableName = tableMatch[1] as keyof typeof TABLES;
    if (!TABLES[tableName]) {
      console.log(`Table ${tableName} not found in JSON storage, returning empty array`);
      return [[]];
    }
    
    const data = await jsonStorage.getAll(tableName);
    let result = data;
    
    // WHERE koşullarını handle et
    if (sql.includes('WHERE')) {
      // is_active = 1 koşulu
      if (sql.includes('is_active') && sql.includes('= 1')) {
        result = result.filter((item: any) => item.is_active === 1 || item.is_active === true);
      }
      
      // id = ? koşulu
      const idMatch = sql.match(/WHERE\s+id\s*=\s*\?/i);
      if (idMatch && params.length > 0) {
        const id = params[0];
        console.log('🔍 ID matching:', { id, type: typeof id, totalItems: result.length });
        result = result.filter((item: any) => {
          const matches = item.id === id || 
            item.id === String(id) || 
            String(item.id) === String(id);
          if (matches) console.log('✅ ID match found:', item.id);
          return matches;
        });
        console.log('🔍 After ID filter:', result.length, 'items');
      }
      
      // slug = ? koşulu
      const slugMatch = sql.match(/WHERE\s+slug\s*=\s*\?/i);
      if (slugMatch && params.length > 0) {
        const slug = params[0];
        result = result.filter((item: any) => item.slug === slug);
      }
      
      // Diğer WHERE koşulları
      const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
      if (whereMatch && params.length > 0 && !idMatch && !slugMatch) {
        const field = whereMatch[1];
        const value = params[0];
        result = result.filter((item: any) => item[field] === value);
      }
    }
    
    // ORDER BY
    if (sql.includes('ORDER BY')) {
      if (sql.includes('ORDER BY created_at DESC')) {
        result = result.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sql.includes('ORDER BY sort_order')) {
        result = result.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    }
    
    // LIMIT ve OFFSET
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    const offsetMatch = sql.match(/OFFSET\s+(\d+)/i);
    
    if (offsetMatch) {
      result = result.slice(parseInt(offsetMatch[1]));
    }
    if (limitMatch) {
      result = result.slice(0, parseInt(limitMatch[1]));
    }
    
    return [result];
  },

  async handleInsert(sql: string, params: any[]): Promise<any[]> {
    const tableMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i);
    if (!tableMatch) return [];
    
    const tableName = tableMatch[1] as keyof typeof TABLES;
    if (!TABLES[tableName]) return [];
    
    // Basit INSERT parsing (VALUES kısmını parse et)
    const valuesMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);
    if (!valuesMatch) return [];
    
    // Bu basit bir implementasyon - gerçek projede daha gelişmiş parsing gerekir
    const newItem: any = {
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Parametreleri field'lara map et (basit implementasyon)
    if (params.length > 0) {
      newItem.title = params[0];
      if (params.length > 1) newItem.slug = params[1];
      if (params.length > 2) newItem.content = params[2];
      if (params.length > 3) newItem.is_active = params[3];
    }
    
    await jsonStorage.create(tableName, newItem);
    return [{ insertId: newItem.id, affectedRows: 1 }];
  },

  async handleUpdate(sql: string, params: any[]): Promise<any[]> {
    const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch) return [];
    
    const tableName = tableMatch[1] as keyof typeof TABLES;
    if (!TABLES[tableName]) return [];
    
    const idMatch = sql.match(/WHERE\s+id\s*=\s*\?/i);
    if (!idMatch || params.length === 0) return [];
    
    // ID'yi son parametreden al (WHERE id = ? en sonda)
    const id = params[params.length - 1];
    const updates: any = {};
    
    // Gelişmiş UPDATE parsing - SET kısmını parse et
    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
    if (setMatch) {
      const setClause = setMatch[1];
      const setFields = setClause.split(',').map(field => field.trim());
      
      let paramIndex = 0; // İlk parametre SET'ten başlar
      setFields.forEach(field => {
        if (field.includes('= ?')) {
          const fieldName = field.split('=')[0].trim();
          if (paramIndex < params.length - 1) { // Son parametre ID
            updates[fieldName] = params[paramIndex];
            paramIndex++;
          }
        } else if (field.includes('= NOW()')) {
          const fieldName = field.split('=')[0].trim();
          updates[fieldName] = new Date().toISOString();
        }
      });
    }
    
    console.log('🔄 UPDATE operation:', { tableName, id, updates, params });
    const result = await jsonStorage.update(tableName, id, updates);
    return [{ affectedRows: result ? 1 : 0 }];
  },

  async handleDelete(sql: string, params: any[]): Promise<any[]> {
    const tableMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
    if (!tableMatch) return [];
    
    const tableName = tableMatch[1] as keyof typeof TABLES;
    if (!TABLES[tableName]) return [];
    
    const idMatch = sql.match(/WHERE\s+id\s*=\s*\?/i);
    if (!idMatch || params.length === 0) return [];
    
    const id = params[0];
    const result = await jsonStorage.delete(tableName, id);
    return [{ affectedRows: result ? 1 : 0 }];
  }
};

export default jsonStorage;
