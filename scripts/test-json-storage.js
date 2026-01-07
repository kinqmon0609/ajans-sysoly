const fs = require('fs');
const path = require('path');

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
  settings: 'settings.json'
};

// Data klasörünü oluştur
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('📁 Data klasörü oluşturuldu:', DATA_DIR);
  }
}

// JSON dosyasını oku
function readJsonFile(tableName) {
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
function writeJsonFile(tableName, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, TABLES[tableName]);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ ${tableName} dosyası yazıldı: ${data.length} kayıt`);
  } catch (error) {
    console.error(`Error writing ${tableName}:`, error);
    throw error;
  }
}

// ID oluştur
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Başlangıç verileri
const initialData = {
  menus: [
    {
      name: 'Hakkımızda',
      url: '/hakkimizda',
      parent_id: null,
      sort_order: 0,
      is_active: true
    },
    {
      name: 'Hizmetlerimiz',
      url: '/hizmetlerimiz',
      parent_id: null,
      sort_order: 1,
      is_active: true
    },
    {
      name: 'İletişim',
      url: '/iletisim',
      parent_id: null,
      sort_order: 2,
      is_active: true
    }
  ],

  categories: [
    {
      name: 'Web Sitesi',
      slug: 'web-sitesi',
      description: 'Kurumsal ve e-ticaret web siteleri',
      icon: '🌐',
      color: '#3B82F6',
      is_active: true,
      sort_order: 1
    },
    {
      name: 'E-Ticaret',
      slug: 'e-ticaret',
      description: 'Online satış platformları',
      icon: '🛒',
      color: '#F59E0B',
      is_active: true,
      sort_order: 2
    }
  ],

  demos: [
    {
      title: 'Modern E-Ticaret Sitesi',
      description: 'Responsive tasarım, güvenli ödeme sistemi ve admin paneli ile tam özellikli e-ticaret sitesi.',
      category: 'E-Ticaret',
      price: 25000,
      demo_url: 'https://demo1.example.com',
      is_active: true,
      images: ['/placeholder.svg', '/placeholder.svg'],
      features: ['Responsive Tasarım', 'Güvenli Ödeme', 'Admin Panel', 'SEO Optimizasyonu'],
      technologies: ['React', 'Next.js', 'Node.js', 'MySQL']
    }
  ],

  packages: [
    {
      name: 'Temel Paket',
      description: 'Küçük işletmeler için ideal başlangıç paketi',
      price: 5000,
      features: ['5 Sayfa', 'Responsive Tasarım', 'SEO Temel', '1 Yıl Hosting'],
      is_popular: false,
      is_active: true
    },
    {
      name: 'Profesyonel Paket',
      description: 'Orta ölçekli işletmeler için kapsamlı çözüm',
      price: 12000,
      features: ['10 Sayfa', 'Responsive Tasarım', 'SEO Gelişmiş', 'Admin Panel', '2 Yıl Hosting'],
      is_popular: true,
      is_active: true
    }
  ],

  pages: [
    {
      title: 'Hakkımızda',
      slug: 'hakkimizda',
      content: [
        {
          type: 'heading',
          content: 'Hakkımızda',
          level: 1
        },
        {
          type: 'paragraph',
          content: 'Biz, modern web teknolojileri ile işletmenizi dijital dünyada öne çıkaran profesyonel bir ekibiz.'
        }
      ],
      meta_title: 'Hakkımızda - Ajans1',
      meta_description: 'Modern web teknolojileri ile hizmet veren profesyonel ajansımız hakkında bilgi alın.',
      is_active: true,
      sort_order: 0
    }
  ]
};

// Veritabanını başlat
async function initializeJsonDatabase() {
  console.log('🚀 JSON veritabanı başlatılıyor...');
  
  try {
    // Her tablo için başlangıç verilerini kontrol et ve ekle
    for (const [tableName, data] of Object.entries(initialData)) {
      const existingData = readJsonFile(tableName);
      
      if (existingData.length === 0) {
        console.log(`📝 ${tableName} tablosuna başlangıç verileri ekleniyor...`);
        
        // Her kayıt için ID ve timestamp ekle
        const dataWithIds = data.map(item => ({
          ...item,
          id: generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        writeJsonFile(tableName, dataWithIds);
      } else {
        console.log(`ℹ️  ${tableName} tablosu zaten veri içeriyor (${existingData.length} kayıt)`);
      }
    }
    
    console.log('🎉 JSON veritabanı başarıyla başlatıldı!');
    return true;
  } catch (error) {
    console.error('❌ JSON veritabanı başlatma hatası:', error);
    return false;
  }
}

// Test fonksiyonu
async function testJsonStorage() {
  console.log('🧪 JSON Storage test ediliyor...\n');
  
  const result = await initializeJsonDatabase();
  
  if (result) {
    console.log('\n📊 Test Sonuçları:');
    
    // Her tablo için kayıt sayısını göster
    for (const tableName of Object.keys(initialData)) {
      const data = readJsonFile(tableName);
      console.log(`  ${tableName}: ${data.length} kayıt`);
    }
    
    console.log('\n✅ JSON Storage test başarılı!');
  } else {
    console.log('\n❌ JSON Storage test başarısız!');
  }
}

// Script çalıştır
if (require.main === module) {
  testJsonStorage().catch(console.error);
}

module.exports = {
  initializeJsonDatabase,
  readJsonFile,
  writeJsonFile,
  generateId
};
