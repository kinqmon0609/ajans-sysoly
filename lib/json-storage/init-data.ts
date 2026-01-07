import { jsonStorage } from './client';

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
      name: 'E-Ticaret',
      url: '/e-ticaret',
      parent_id: null,
      sort_order: 2,
      is_active: true
    },
    {
      name: 'Web Tasarım',
      url: '/web-tasarim',
      parent_id: null,
      sort_order: 3,
      is_active: true
    },
    {
      name: 'Yazılımlarımız',
      url: '/demolarimiz',
      parent_id: null,
      sort_order: 4,
      is_active: true
    },
    {
      name: 'Paketlerimiz',
      url: '/paketlerimiz',
      parent_id: null,
      sort_order: 5,
      is_active: true
    },
    {
      name: 'Blog',
      url: '/blog',
      parent_id: null,
      sort_order: 6,
      is_active: true
    },
    {
      name: 'İletişim',
      url: '/iletisim',
      parent_id: null,
      sort_order: 7,
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
      name: 'Mobil Uygulama',
      slug: 'mobil-uygulama',
      description: 'iOS ve Android mobil uygulamalar',
      icon: '📱',
      color: '#10B981',
      is_active: true,
      sort_order: 2
    },
    {
      name: 'Özel Yazılım',
      slug: 'ozel-yazilim',
      description: 'İşletmelere özel yazılım çözümleri',
      icon: '⚙️',
      color: '#8B5CF6',
      is_active: true,
      sort_order: 3
    },
    {
      name: 'E-Ticaret',
      slug: 'e-ticaret',
      description: 'Online satış platformları',
      icon: '🛒',
      color: '#F59E0B',
      is_active: true,
      sort_order: 4
    },
    {
      name: 'Kurumsal',
      slug: 'kurumsal',
      description: 'Kurumsal web siteleri',
      icon: '🏢',
      color: '#EF4444',
      is_active: true,
      sort_order: 5
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
    },
    {
      title: 'Kurumsal Web Sitesi',
      description: 'Profesyonel kurumsal kimlik ve modern tasarım ile işletmenizi dijitale taşıyın.',
      category: 'Kurumsal',
      price: 15000,
      demo_url: 'https://demo2.example.com',
      is_active: true,
      images: ['/placeholder.svg', '/placeholder.svg'],
      features: ['Modern Tasarım', 'Hızlı Yükleme', 'SEO Dostu', 'Mobil Uyumlu'],
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS']
    },
    {
      title: 'Mobil Uygulama',
      description: 'iOS ve Android platformları için native mobil uygulama.',
      category: 'Mobil Uygulama',
      price: 35000,
      demo_url: 'https://demo3.example.com',
      is_active: true,
      images: ['/placeholder.svg', '/placeholder.svg'],
      features: ['Native Performance', 'Offline Support', 'Push Notifications', 'App Store Ready'],
      technologies: ['React Native', 'TypeScript', 'Firebase']
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
    },
    {
      name: 'Premium Paket',
      description: 'Büyük işletmeler için tam özellikli çözüm',
      price: 25000,
      features: ['Sınırsız Sayfa', 'Responsive Tasarım', 'SEO Premium', 'Admin Panel', 'E-Ticaret', '3 Yıl Hosting'],
      is_popular: false,
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
          content: 'Biz, modern web teknolojileri ile işletmenizi dijital dünyada öne çıkaran profesyonel bir ekibiz. 10 yılı aşkın deneyimimizle, müşterilerimize en kaliteli hizmeti sunmayı hedefliyoruz.'
        },
        {
          type: 'heading',
          content: 'Misyonumuz',
          level: 2
        },
        {
          type: 'paragraph',
          content: 'Teknoloji ve yaratıcılığı birleştirerek, işletmelerin dijital dönüşümüne öncülük etmek.'
        }
      ],
      meta_title: 'Hakkımızda - Ajans1',
      meta_description: 'Modern web teknolojileri ile hizmet veren profesyonel ajansımız hakkında bilgi alın.',
      meta_keywords: 'hakkımızda, ajans, web tasarım, yazılım',
      is_active: true,
      sort_order: 0
    },
    {
      title: 'İletişim',
      slug: 'iletisim',
      content: [
        {
          type: 'heading',
          content: 'İletişim',
          level: 1
        },
        {
          type: 'paragraph',
          content: 'Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.'
        },
        {
          type: 'heading',
          content: 'İletişim Bilgileri',
          level: 2
        },
        {
          type: 'paragraph',
          content: '📧 E-posta: info@ajans1.com\n📞 Telefon: +90 (212) 123 45 67\n📍 Adres: İstanbul, Türkiye'
        }
      ],
      meta_title: 'İletişim - Ajans1',
      meta_description: 'Ajans1 ile iletişime geçin. Projeleriniz için bizimle iletişime geçebilirsiniz.',
      meta_keywords: 'iletişim, ajans, proje, teklif',
      is_active: true,
      sort_order: 1
    }
  ],

  blog: [
    {
      title: 'Modern Web Tasarım Trendleri 2024',
      slug: 'modern-web-tasarim-trendleri-2024',
      content: `
        <h1>Modern Web Tasarım Trendleri 2024</h1>
        <p>2024 yılında web tasarımında öne çıkan trendleri sizler için derledik.</p>
        
        <h2>1. Minimalist Tasarım</h2>
        <p>Daha az, daha iyi felsefesi ile minimalist tasarımlar öne çıkıyor.</p>
        
        <h2>2. Koyu Tema</h2>
        <p>Kullanıcı deneyimini artıran koyu tema tasarımları popülerliğini koruyor.</p>
        
        <h2>3. Mikro Etkileşimler</h2>
        <p>Kullanıcı etkileşimini artıran küçük animasyonlar ve geçişler.</p>
      `,
      excerpt: '2024 yılında web tasarımında öne çıkan trendler ve gelecekte bizi bekleyen yenilikler.',
      featured_image: '/placeholder.svg',
      is_active: true
    },
    {
      title: 'E-Ticaret Sitesi Kurarken Dikkat Edilmesi Gerekenler',
      slug: 'e-ticaret-sitesi-kurarken-dikkat-edilmesi-gerekenler',
      content: `
        <h1>E-Ticaret Sitesi Kurarken Dikkat Edilmesi Gerekenler</h1>
        <p>Başarılı bir e-ticaret sitesi kurmak için dikkat edilmesi gereken önemli noktalar.</p>
        
        <h2>1. Güvenlik</h2>
        <p>SSL sertifikası ve güvenli ödeme sistemleri mutlaka kullanılmalı.</p>
        
        <h2>2. Kullanıcı Deneyimi</h2>
        <p>Kolay navigasyon ve hızlı yükleme süreleri kritik önem taşır.</p>
        
        <h2>3. Mobil Uyumluluk</h2>
        <p>Mobil cihazlarda mükemmel çalışan responsive tasarım şart.</p>
      `,
      excerpt: 'E-ticaret sitesi kurarken dikkat edilmesi gereken teknik ve tasarım konuları.',
      featured_image: '/placeholder.svg',
      is_active: true
    }
  ],

  settings: [
    {
      key: 'site_title',
      value: 'Ajans1 - Modern Web Çözümleri',
      type: 'string'
    },
    {
      key: 'site_description',
      value: 'Modern web teknolojileri ile işletmenizi dijital dünyada öne çıkarın.',
      type: 'string'
    },
    {
      key: 'contact_email',
      value: 'info@ajans1.com',
      type: 'string'
    },
    {
      key: 'contact_phone',
      value: '+90 (212) 123 45 67',
      type: 'string'
    },
    {
      key: 'social_media',
      value: JSON.stringify({
        facebook: 'https://facebook.com/ajans1',
        twitter: 'https://twitter.com/ajans1',
        instagram: 'https://instagram.com/ajans1',
        linkedin: 'https://linkedin.com/company/ajans1'
      }),
      type: 'json'
    }
  ]
};

// Veritabanını başlat
export async function initializeJsonDatabase() {
  console.log('🚀 JSON veritabanı başlatılıyor...');
  
  try {
    // Her tablo için başlangıç verilerini kontrol et ve ekle
    for (const [tableName, data] of Object.entries(initialData)) {
      const existingData = await jsonStorage.getAll(tableName as keyof typeof initialData);
      
      if (existingData.length === 0) {
        console.log(`📝 ${tableName} tablosuna başlangıç verileri ekleniyor...`);
        await jsonStorage.bulkCreate(tableName as keyof typeof initialData, data as any[]);
        console.log(`✅ ${tableName} tablosuna ${data.length} kayıt eklendi`);
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

// Veritabanını sıfırla (geliştirme için)
export async function resetJsonDatabase() {
  console.log('🔄 JSON veritabanı sıfırlanıyor...');
  
  try {
    for (const tableName of Object.keys(initialData)) {
      await jsonStorage.truncate(tableName as keyof typeof initialData);
    }
    
    await initializeJsonDatabase();
    console.log('✅ JSON veritabanı sıfırlandı ve yeniden başlatıldı!');
    return true;
  } catch (error) {
    console.error('❌ JSON veritabanı sıfırlama hatası:', error);
    return false;
  }
}

// export default initialData; // Kullanılmıyor, warning'i önlemek için kaldırıldı
