const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

async function resetDemos() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'ajans1_db',
    charset: 'utf8mb4',
  });

  try {
    console.log('🔄 Mevcut demolar temizleniyor...');
    await connection.execute('DELETE FROM demos');

    console.log('✨ Yeni demolar ekleniyor...');
    
    const demos = [
      {
        id: randomUUID(),
        title: 'Modern E-Ticaret Sitesi',
        description: 'React ve Next.js ile geliştirilmiş, modern ve hızlı e-ticaret platformu',
        category: 'E-Ticaret',
        price: 2499.99,
        images: JSON.stringify(['/placeholder.jpg']),
        features: JSON.stringify(['Responsive Tasarım', 'Hızlı Yükleme', 'SEO Optimize']),
        technologies: JSON.stringify(['React', 'Next.js', 'Tailwind CSS']),
        demo_url: 'https://demo.example.com/ecommerce',
        is_active: true
      },
      {
        id: randomUUID(),
        title: 'Kurumsal Web Sitesi',
        description: 'Profesyonel kurumsal kimlik için özel tasarım',
        category: 'Kurumsal',
        price: 1999.99,
        images: JSON.stringify(['/placeholder.jpg']),
        features: JSON.stringify(['CMS Entegrasyonu', 'Çok Dilli Destek']),
        technologies: JSON.stringify(['WordPress', 'PHP']),
        demo_url: null,
        is_active: true
      },
      {
        id: randomUUID(),
        title: 'Blog Platformu',
        description: 'Kişisel veya kurumsal blog için hazır platform',
        category: 'Blog',
        price: 999.99,
        images: JSON.stringify(['/placeholder.jpg']),
        features: JSON.stringify(['Yorum Sistemi', 'Kategori Yönetimi']),
        technologies: JSON.stringify(['Next.js', 'MDX']),
        demo_url: 'https://demo.example.com/blog',
        is_active: true
      }
    ];

    for (const demo of demos) {
      await connection.execute(`
        INSERT INTO demos (id, title, description, category, price, images, features, technologies, demo_url, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        demo.id,
        demo.title,
        demo.description,
        demo.category,
        demo.price,
        demo.images,
        demo.features,
        demo.technologies,
        demo.demo_url,
        demo.is_active
      ]);
      console.log(`✅ ${demo.title} eklendi`);
    }

    console.log('\n🎉 Demolar başarıyla sıfırlandı!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await connection.end();
  }
}

resetDemos();





