import dbPool, { getDatabase } from './client';

// Pool'u dbPool'dan al
const pool = dbPool;

// Demos - ULTRA OPTIMIZED (sadece thumbnail, tüm images array çekmiyoruz)
export async function getDemos(limit = 50, offset = 0) {
  try {
    // Number'a çevir - güvenli değerler
    const safeLimit = Math.max(1, Math.min(parseInt(String(limit)) || 50, 100));
    const safeOffset = Math.max(0, parseInt(String(offset)) || 0);

    // MAMP/cPanel uyumlu: execute() + string concat (güvenli - parseInt ile sanitize edildi)
    const query = `
      SELECT 
        id, 
        title, 
        SUBSTRING(description, 1, 150) as description,
        category, 
        price, 
        demo_url, 
        is_active, 
        created_at, 
        updated_at,
        SUBSTRING(images, 1, 2000) as thumbnail
      FROM demos 
      WHERE is_active = 1
      ORDER BY created_at DESC
      LIMIT ${safeOffset}, ${safeLimit}
    `;

    const [rows] = await pool.execute(query);

    return (rows as any[]).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      price: row.price,
      demo_url: row.demo_url,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      thumbnail: row.thumbnail || '/placeholder.svg',
      shortDescription: row.description || ''
    }));
  } catch (error) {
    console.error('Error in getDemos:', error);
    throw error;
  }
}

// Admin paneli - ULTRA OPTIMIZED (pagination)
export async function getAdminDemos(limit = 100, offset = 0) {
  try {
    // Number'a çevir - güvenli değerler
    const safeLimit = Math.max(1, Math.min(parseInt(String(limit)) || 100, 200));
    const safeOffset = Math.max(0, parseInt(String(offset)) || 0);

    // MAMP/cPanel uyumlu: execute() + string concat (güvenli - parseInt ile sanitize edildi)
    const query = `
      SELECT 
        id, 
        title, 
        SUBSTRING(description, 1, 150) as description,
        category, 
        price, 
        demo_url, 
        is_active, 
        created_at, 
        updated_at,
        SUBSTRING(images, 1, 2000) as thumbnail
      FROM demos 
      ORDER BY created_at DESC
      LIMIT ${safeOffset}, ${safeLimit}
    `;

    const [rows] = await pool.execute(query);

    return (rows as any[]).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      price: row.price,
      demo_url: row.demo_url,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      thumbnail: row.thumbnail || '/placeholder.svg',
      shortDescription: row.description || ''
    }));
  } catch (error) {
    console.error('Error in getAdminDemos:', error);
    throw error;
  }
}

// Total count için - production-ready
export async function getDemosCount(includeInactive = false) {
  try {
    const query = includeInactive
      ? 'SELECT COUNT(*) as total FROM demos'
      : 'SELECT COUNT(*) as total FROM demos WHERE is_active = 1';
    const [rows] = await pool.execute(query);
    return (rows as any[])[0]?.total || 0;
  } catch (error) {
    console.error('Error in getDemosCount:', error);
    return 0;
  }
}

// Categories - MySQL'den çek
export async function getCategories() {
  try {
    console.log('🔵 getCategories called');
    
    console.log('🔵 Executing categories query');
    const [rows] = await pool.execute(`
      SELECT id, name, slug, description, icon, is_active, display_order as sort_order, created_at, updated_at
      FROM categories 
      WHERE is_active = 1
      ORDER BY display_order ASC
    `);
    
    console.log('🔵 Categories query result:', (rows as any[]).length, 'categories');
    return rows as any[];
  } catch (error) {
    console.error('❌ Error in getCategories:', error);
    throw error;
  }
}

// Menus - MySQL'den çek
export async function getMenus() {
  try {
    const [rows] = await pool.execute(`
      SELECT id, name, slug, description, is_active, display_order, created_at, updated_at
      FROM menus 
      WHERE is_active = true
      ORDER BY display_order ASC
    `);
    return rows as any[];
  } catch (error) {
    console.error('Error in getMenus:', error);
    throw error;
  }
}

// Menu Items - MySQL'den çek
export async function getMenuItems(menuId?: string) {
  try {
    let query = `
      SELECT id, menu_id, page_id, label, url, parent_id, display_order, is_active, created_at, updated_at
      FROM menu_items 
      WHERE is_active = 1
    `;

    if (menuId) {
      query += ` AND menu_id = ?`;
    }

    query += ` ORDER BY display_order ASC`;

    const params = menuId ? [menuId] : [];
    const [rows] = await pool.execute(query, params);
    return rows as any[];
  } catch (error) {
    console.error('Error in getMenuItems:', error);
    throw error;
  }
}

export async function getDemoById(id: string) {
  const [rows] = await pool.execute(`
    SELECT id, title, description, category, price, demo_url, is_active, 
           created_at, updated_at, images, features, technologies 
    FROM demos WHERE id = ? LIMIT 1
  `, [id]);

  if (Array.isArray(rows) && rows.length > 0) {
    const demo = rows[0] as any;

    // JSON string'leri parse et - with size limits for performance
    try {
      const imagesStr = typeof demo.images === 'string' ? demo.images : JSON.stringify(demo.images || []);
      const allImages = JSON.parse(imagesStr);
      // Limit: Max 10 images to reduce payload
      demo.images = Array.isArray(allImages) ? allImages.slice(0, 10) : [];
    } catch (error) {
      console.error('Error parsing demo images:', error);
      demo.images = [];
    }

    try {
      const featuresStr = typeof demo.features === 'string' ? demo.features : JSON.stringify(demo.features || []);
      const allFeatures = JSON.parse(featuresStr);
      // Limit: Max 20 features
      demo.features = Array.isArray(allFeatures) ? allFeatures.slice(0, 20) : [];
    } catch (error) {
      console.error('Error parsing demo features:', error);
      demo.features = [];
    }

    try {
      const techStr = typeof demo.technologies === 'string' ? demo.technologies : JSON.stringify(demo.technologies || []);
      const allTech = JSON.parse(techStr);
      // Limit: Max 15 technologies
      demo.technologies = Array.isArray(allTech) ? allTech.slice(0, 15) : [];
    } catch (error) {
      console.error('Error parsing demo technologies:', error);
      demo.technologies = [];
    }

    return demo;
  }

  return null;
}

export async function createDemo(demo: any) {
  const [result] = await pool.execute(`
    INSERT INTO demos (id, title, description, category, price, images, features, technologies, demo_url, is_active)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    demo.title,
    demo.description,
    demo.category,
    demo.price,
    JSON.stringify(demo.images || []),
    JSON.stringify(demo.features || []),
    JSON.stringify(demo.technologies || []),
    demo.demo_url,
    demo.is_active ?? true
  ]);
  return result;
}

export async function updateDemo(id: string, demo: any) {
  const [result] = await pool.execute(`
    UPDATE demos 
    SET title = ?, description = ?, category = ?, price = ?, images = ?, features = ?, technologies = ?, demo_url = ?, is_active = ?
    WHERE id = ?
  `, [
    demo.title,
    demo.description,
    demo.category,
    demo.price,
    JSON.stringify(demo.images || []),
    JSON.stringify(demo.features || []),
    JSON.stringify(demo.technologies || []),
    demo.demo_url,
    demo.is_active ?? true,
    id
  ]);
  return result;
}

export async function deleteDemo(id: string) {
  const [result] = await pool.execute(`
    DELETE FROM demos WHERE id = ?
  `, [id]);
  return result;
}

export async function getCategoryById(id: string) {
  const [rows] = await pool.execute(`
    SELECT * FROM categories WHERE id = ?
  `, [id]);
  return Array.isArray(rows) ? rows[0] : null;
}

// Contacts
export async function getContacts() {
  const [rows] = await pool.execute(`
    SELECT * FROM contacts 
    ORDER BY created_at DESC
  `);
  return rows;
}

export async function createContact(contact: any) {
  const [result] = await pool.execute(`
    INSERT INTO contacts (id, name, email, phone, subject, message)
    VALUES (UUID(), ?, ?, ?, ?, ?)
  `, [
    contact.name,
    contact.email,
    contact.phone,
    contact.subject,
    contact.message
  ]);
  return result;
}

// Testimonials
export async function getTestimonials(featured = false) {
  let query = `
    SELECT * FROM testimonials 
    WHERE is_active = true
  `;

  if (featured) {
    query += ` AND is_featured = true`;
  }

  query += ` ORDER BY created_at DESC`;

  const [rows] = await pool.execute(query);
  return rows;
}

// FAQs
export async function getFAQs() {
  const [rows] = await pool.execute(`
    SELECT * FROM faqs 
    WHERE is_active = true 
    ORDER BY order_index ASC
  `);
  return rows;
}

// About Content
export async function getAboutContent() {
  const [rows] = await pool.execute(`
    SELECT * FROM about_content 
    WHERE is_active = true 
    ORDER BY section_order ASC
  `);
  return rows;
}

// Pages
export async function getPages() {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM pages 
      ORDER BY sort_order ASC, created_at DESC
    `);

    // JSON string'leri parse et
    return (rows as any[]).map((page: any) => {
      if (typeof page.content === 'string') {
        try {
          page.content = JSON.parse(page.content);
        } catch (error) {
          console.error('Error parsing page content:', error);
          page.content = [];
        }
      }
      return page;
    });
  } catch (error) {
    console.error('getPages error:', error);
    throw error;
  }
}

export async function getPageBySlug(slug: string) {
  const [rows] = await pool.execute(`
    SELECT * FROM pages WHERE slug = ?
  `, [slug]);

  if (Array.isArray(rows) && rows.length > 0) {
    const page = rows[0] as any;
    // JSON string'i parse et
    if (typeof page.content === 'string') {
      try {
        page.content = JSON.parse(page.content);
      } catch (error) {
        console.error('Error parsing page content:', error);
        page.content = [];
      }
    }
    return page;
  }
  return null;
}

// Analytics
export async function recordDemoView(demoId: string, ipAddress?: string, userAgent?: string) {
  const [result] = await pool.execute(`
    INSERT INTO demo_views (id, demo_id, ip_address, user_agent)
    VALUES (UUID(), ?, ?, ?)
  `, [demoId, ipAddress, userAgent]);
  return result;
}

export async function getDemoViews(demoId: string) {
  const [rows] = await pool.execute(`
    SELECT COUNT(*) as view_count FROM demo_views WHERE demo_id = ?
  `, [demoId]);
  return Array.isArray(rows) ? rows[0] : null;
}

// Packages
export async function getPackages() {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM packages 
      WHERE is_active = true 
      ORDER BY display_order ASC, created_at ASC
    `);

    return (rows as any[]).map((pkg: any) => {
      if (typeof pkg.features === 'string') {
        try {
          pkg.features = JSON.parse(pkg.features);
        } catch (error) {
          console.error('Error parsing package features:', error);
          pkg.features = [];
        }
      }
      return pkg;
    });
  } catch (error) {
    console.error('Error in getPackages:', error);
    throw error;
  }
}

export async function getAdminPackages() {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM packages 
      ORDER BY display_order ASC, created_at ASC
    `);

    return (rows as any[]).map((pkg: any) => {
      if (typeof pkg.features === 'string') {
        try {
          pkg.features = JSON.parse(pkg.features);
        } catch (error) {
          console.error('Error parsing package features:', error);
          pkg.features = [];
        }
      }
      return pkg;
    });
  } catch (error) {
    console.error('Error in getAdminPackages:', error);
    throw error;
  }
}

export async function getPackageById(id: string) {
  const [rows] = await pool.execute(`
    SELECT * FROM packages WHERE id = ?
  `, [id]);

  if (Array.isArray(rows) && rows.length > 0) {
    const pkg = rows[0] as any;

    try {
      pkg.features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : (pkg.features || []);
    } catch (error) {
      console.error('Error parsing package features:', error);
      pkg.features = [];
    }

    return pkg;
  }

  return null;
}

export async function createPackage(pkg: any) {
  const [result] = await pool.execute(`
    INSERT INTO packages (id, name, description, price, features, is_active, display_order)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?)
  `, [
    pkg.name,
    pkg.description || null,
    pkg.price,
    JSON.stringify(pkg.features || []),
    pkg.is_active ?? true,
    pkg.display_order ?? 0
  ]);
  return result;
}

export async function updatePackage(id: string, pkg: any) {
  const [result] = await pool.execute(`
    UPDATE packages 
    SET name = ?, description = ?, price = ?, features = ?, is_active = ?, display_order = ?
    WHERE id = ?
  `, [
    pkg.name,
    pkg.description || null,
    pkg.price,
    JSON.stringify(pkg.features || []),
    pkg.is_active ?? true,
    pkg.display_order ?? 0,
    id
  ]);
  return result;
}

export async function deletePackage(id: string) {
  const [result] = await pool.execute(`
    DELETE FROM packages WHERE id = ?
  `, [id]);
  return result;
}

// Popups
export async function getPopups() {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM popups 
      WHERE is_active = true 
      AND show_on_homepage = true
      AND (start_date IS NULL OR start_date <= NOW())
      AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY display_order ASC, created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error in getPopups:', error);
    throw error;
  }
}

export async function getAdminPopups() {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM popups 
      ORDER BY display_order ASC, created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error in getAdminPopups:', error);
    throw error;
  }
}

export async function getPopupById(id: string) {
  const [rows] = await pool.execute(`
    SELECT * FROM popups WHERE id = ?
  `, [id]);

  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0];
  }

  return null;
}

export async function createPopup(popup: any) {
  const [result] = await pool.execute(`
    INSERT INTO popups (id, title, description, image_url, button_text, button_link, is_active, show_on_homepage, start_date, end_date, display_order)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    popup.title,
    popup.description || null,
    popup.image_url || null,
    popup.button_text || null,
    popup.button_link || null,
    popup.is_active ?? true,
    popup.show_on_homepage ?? true,
    popup.start_date || null,
    popup.end_date || null,
    popup.display_order ?? 0
  ]);
  return result;
}

export async function updatePopup(id: string, popup: any) {
  const [result] = await pool.execute(`
    UPDATE popups 
    SET title = ?, description = ?, image_url = ?, button_text = ?, button_link = ?, 
        is_active = ?, show_on_homepage = ?, start_date = ?, end_date = ?, display_order = ?
    WHERE id = ?
  `, [
    popup.title,
    popup.description || null,
    popup.image_url || null,
    popup.button_text || null,
    popup.button_link || null,
    popup.is_active ?? true,
    popup.show_on_homepage ?? true,
    popup.start_date || null,
    popup.end_date || null,
    popup.display_order ?? 0,
    id
  ]);
  return result;
}

export async function deletePopup(id: string) {
  const [result] = await pool.execute(`
    DELETE FROM popups WHERE id = ?
  `, [id]);
  return result;
}

// Blog Posts
export async function getBlogPosts(publishedOnly = false) {
  try {
    // Use blog table instead of blog_posts
    let query = `SELECT * FROM blog ORDER BY created_at DESC`;
    if (publishedOnly) {
      query = `SELECT bp.*, bc.name as category_name, bc.slug as category_slug 
               FROM blog_posts bp 
               LEFT JOIN blog_categories bc ON bp.category_id = bc.id 
               WHERE bp.status = 'published' 
               ORDER BY bp.published_at DESC`;
    }
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    throw error;
  }
}

export async function getBlogPostBySlug(slug: string) {
  const [rows] = await pool.execute(`
    SELECT bp.*, bc.name as category_name, bc.slug as category_slug, bc.id as category_id
    FROM blog_posts bp
    LEFT JOIN blog_categories bc ON bp.category_id = bc.id
    WHERE bp.slug = ?
  `, [slug]);

  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0];
  }

  return null;
}

export async function getBlogPostById(id: string) {
  const [rows] = await pool.execute(`
    SELECT bp.*, bc.name as category_name, bc.slug as category_slug
    FROM blog_posts bp
    LEFT JOIN blog_categories bc ON bp.category_id = bc.id
    WHERE bp.id = ?
  `, [id]);

  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0];
  }

  return null;
}

export async function createBlogPost(post: any) {
  const slug = post.slug || post.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const status = post.status || 'draft';
  const publishDate = post.publish_date || (status === 'published' ? new Date() : null);

  const [result] = await pool.execute(`
    INSERT INTO blog_posts (
      id, title, slug, excerpt, content, cover_image, author, 
      meta_description, meta_keywords, focus_keyword, category_id,
      is_published, published_at, reading_time, seo_score, status, publish_date
    )
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    post.title,
    slug,
    post.excerpt || '',
    post.content,
    post.cover_image || null,
    post.author || 'Admin',
    post.meta_description || null,
    post.meta_keywords || null,
    post.focus_keyword || null,
    post.category_id || null,
    post.is_published ?? (status === 'published'),
    status === 'published' ? new Date() : null,
    post.reading_time || 0,
    post.seo_score || 0,
    status,
    publishDate
  ]);
  return result;
}

export async function updateBlogPost(id: string, post: any) {
  const updates: string[] = [];
  const values: any[] = [];

  if (post.title !== undefined) {
    updates.push('title = ?');
    values.push(post.title);
  }
  if (post.slug !== undefined) {
    updates.push('slug = ?');
    values.push(post.slug);
  }
  if (post.excerpt !== undefined) {
    updates.push('excerpt = ?');
    values.push(post.excerpt);
  }
  if (post.content !== undefined) {
    updates.push('content = ?');
    values.push(post.content);
  }
  if (post.cover_image !== undefined) {
    updates.push('cover_image = ?');
    values.push(post.cover_image);
  }
  if (post.author !== undefined) {
    updates.push('author = ?');
    values.push(post.author);
  }
  if (post.meta_description !== undefined) {
    updates.push('meta_description = ?');
    values.push(post.meta_description);
  }
  if (post.meta_keywords !== undefined) {
    updates.push('meta_keywords = ?');
    values.push(post.meta_keywords);
  }
  if (post.focus_keyword !== undefined) {
    updates.push('focus_keyword = ?');
    values.push(post.focus_keyword);
  }
  if (post.is_published !== undefined) {
    updates.push('is_published = ?');
    values.push(post.is_published);

    // If publishing for the first time, set published_at
    if (post.is_published) {
      updates.push('published_at = NOW()');
    }
  }
  if (post.reading_time !== undefined) {
    updates.push('reading_time = ?');
    values.push(post.reading_time);
  }
  if (post.seo_score !== undefined) {
    updates.push('seo_score = ?');
    values.push(post.seo_score);
  }
  if (post.category_id !== undefined) {
    updates.push('category_id = ?');
    values.push(post.category_id);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(id);

  const [result] = await pool.execute(`
    UPDATE blog_posts 
    SET ${updates.join(', ')}
    WHERE id = ?
  `, values);

  return result;
}

export async function deleteBlogPost(id: string) {
  const [result] = await pool.execute(`
    DELETE FROM blog_posts WHERE id = ?
  `, [id]);
  return result;
}

export async function incrementBlogViewCount(id: string) {
  const [result] = await pool.execute(`
    UPDATE blog_posts SET views = views + 1 WHERE id = ?
  `, [id]);
  return result;
}

// Blog Categories
export async function getBlogCategories() {
  const [rows] = await pool.execute(`
    SELECT * FROM blog_categories ORDER BY name ASC
  `);
  return rows;
}

export async function getBlogCategoryById(id: string) {
  const [rows] = await pool.execute(`
    SELECT * FROM blog_categories WHERE id = ?
  `, [id]);

  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0];
  }
  return null;
}

// Blog Tags
export async function getBlogTags() {
  const [rows] = await pool.execute(`
    SELECT * FROM blog_tags ORDER BY name ASC
  `);
  return rows;
}

export async function createBlogTag(name: string) {
  try {
    // Check if tag already exists
    const [existingTags] = await pool.execute(`
      SELECT * FROM blog_tags WHERE name = ?
    `, [name]);

    if (Array.isArray(existingTags) && existingTags.length > 0) {
      // Return existing tag instead of creating duplicate
      return existingTags[0];
    }

    // Create new tag
    const [result] = await pool.execute(`
      INSERT INTO blog_tags (id, name)
      VALUES (UUID(), ?)
    `, [name]);

    // Fetch and return the created tag
    const [rows] = await pool.execute(`
      SELECT * FROM blog_tags WHERE name = ?
    `, [name]);

    return (rows as any[])[0];
  } catch (error) {
    console.error('Error creating blog tag:', error);
    throw error;
  }
}

export async function getBlogTagById(id: string) {
  const [rows] = await pool.execute(`
    SELECT * FROM blog_tags WHERE id = ?
  `, [id]);

  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0];
  }
  return null;
}

export async function getBlogPostTags(postId: string) {
  try {
    const [rows] = await pool.execute(`
      SELECT bt.* FROM blog_tags bt
      INNER JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
      WHERE bpt.blog_post_id = ?
      ORDER BY bt.name ASC
    `, [postId]);
    return rows;
  } catch (error) {
    console.error('Error in getBlogPostTags:', error);
    return [];
  }
}

export async function setBlogPostTags(postId: string, tagIds: string[]) {
  // Önce mevcut etiketleri sil
  await pool.execute(`
    DELETE FROM blog_post_tags WHERE blog_post_id = ?
  `, [postId]);

  // Yeni etiketleri ekle
  if (tagIds && tagIds.length > 0) {
    const values = tagIds.map(tagId => `('${postId}', '${tagId}')`).join(',');
    await pool.execute(`
      INSERT INTO blog_post_tags (blog_post_id, tag_id) VALUES ${values}
    `);
  }
}

export async function getRelatedBlogPosts(postId: string, categoryId: string, limit: number = 3) {
  try {
    // LIMIT'i güvenli bir şekilde integer olarak kullan
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit))); // 1-100 arası sınırla

    const [rows] = await pool.execute(`
      SELECT id, title, slug, excerpt, featured_image, published_at, read_time
      FROM blog_posts
      WHERE id != ? AND category_id = ? AND status = 'published'
      ORDER BY published_at DESC
      LIMIT ${safeLimit}
    `, [postId, categoryId]);
    return rows;
  } catch (error) {
    console.error('Error in getRelatedBlogPosts:', error);
    return [];
  }
}

// Blog Reactions
export async function recordBlogReaction(postSlug: string, reaction: string, ipAddress?: string) {
  try {
    // First get the post ID from slug
    const [posts] = await pool.execute(`
      SELECT id FROM blog_posts WHERE slug = ?
    `, [postSlug]);

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error('Post not found');
    }

    const postId = (posts[0] as any).id;

    // Insert reaction
    const [result] = await pool.execute(`
      INSERT INTO blog_reactions (id, blog_post_id, reaction_type, ip_address)
      VALUES (UUID(), ?, ?, ?)
    `, [postId, reaction, ipAddress || null]);

    return result;
  } catch (error) {
    console.error('Error recording blog reaction:', error);
    throw error;
  }
}

export async function getBlogReactionStats(postId: string) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        reaction_type,
        COUNT(*) as count
      FROM blog_reactions
      WHERE blog_post_id = ?
      GROUP BY reaction_type
    `, [postId]);

    return rows;
  } catch (error) {
    console.error('Error getting blog reaction stats:', error);
    return [];
  }
}

// ============= USER MANAGEMENT =============

export async function createUser(userData: {
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  role?: 'admin' | 'editor' | 'viewer';
}) {
  const [result] = await pool.execute(`
    INSERT INTO users (id, username, email, password_hash, full_name, role)
    VALUES (UUID(), ?, ?, ?, ?, ?)
  `, [userData.username, userData.email, userData.password_hash, userData.full_name || null, userData.role || 'viewer']);

  return result;
}

export async function getUserById(id: string) {
  const [rows] = await pool.execute(`
    SELECT * FROM users WHERE id = ?
  `, [id]);

  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function getUserByEmail(email: string) {
  const [rows] = await pool.execute(`
    SELECT * FROM users WHERE email = ?
  `, [email]);

  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function getUserByUsername(username: string) {
  const [rows] = await pool.execute(`
    SELECT * FROM users WHERE username = ?
  `, [username]);

  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function updateUser(id: string, updates: any) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  values.push(id);

  await pool.execute(`
    UPDATE users SET ${fields.join(', ')} WHERE id = ?
  `, values);
}

export async function deleteUser(id: string) {
  await pool.execute(`DELETE FROM users WHERE id = ?`, [id]);
}

export async function getAllUsers() {
  const [rows] = await pool.execute(`
    SELECT id, username, email, full_name, role, is_active, last_login_at, created_at 
    FROM users 
    ORDER BY created_at DESC
  `);
  return rows;
}

// Activity Logs
export async function logUserActivity(activity: {
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
}) {
  await pool.execute(`
    INSERT INTO user_activity_logs (id, user_id, action, entity_type, entity_id, ip_address, user_agent, details)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
  `, [
    activity.user_id,
    activity.action,
    activity.entity_type || null,
    activity.entity_id || null,
    activity.ip_address || null,
    activity.user_agent || null,
    activity.details ? JSON.stringify(activity.details) : null
  ]);
}

export async function getUserActivityLogs(userId: string, limit: number = 50) {
  const [rows] = await pool.execute(`
    SELECT * FROM user_activity_logs 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `, [userId, limit]);

  return rows;
}

// ============= EMAIL SYSTEM =============

export async function createEmailTemplate(template: {
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables?: string[];
}) {
  const [result] = await pool.execute(`
    INSERT INTO email_templates (id, name, subject, html_content, text_content, variables)
    VALUES (UUID(), ?, ?, ?, ?, ?)
  `, [
    template.name,
    template.subject,
    template.html_content,
    template.text_content || null,
    template.variables ? JSON.stringify(template.variables) : '[]'
  ]);

  return result;
}

export async function getEmailTemplate(name: string) {
  const [rows] = await pool.execute(`
    SELECT * FROM email_templates WHERE name = ? AND is_active = 1
  `, [name]);

  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function queueEmail(email: {
  to_email: string;
  to_name?: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_id?: string;
  scheduled_at?: Date;
}) {
  const [result] = await pool.execute(`
    INSERT INTO email_queue (id, to_email, to_name, subject, html_content, text_content, template_id, scheduled_at)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
  `, [
    email.to_email,
    email.to_name || null,
    email.subject,
    email.html_content,
    email.text_content || null,
    email.template_id || null,
    email.scheduled_at || null
  ]);

  return result;
}

export async function getPendingEmails(limit: number = 10) {
  const [rows] = await pool.execute(`
    SELECT * FROM email_queue 
    WHERE status = 'pending' 
      AND attempts < max_attempts
      AND (scheduled_at IS NULL OR scheduled_at <= NOW())
    ORDER BY created_at ASC 
    LIMIT ?
  `, [limit]);

  return rows;
}

export async function updateEmailStatus(id: string, status: 'sent' | 'failed', errorMessage?: string) {
  await pool.execute(`
    UPDATE email_queue 
    SET status = ?, 
        attempts = attempts + 1,
        sent_at = IF(? = 'sent', NOW(), NULL),
        error_message = ?
    WHERE id = ?
  `, [status, status, errorMessage || null, id]);
}

// Newsletter
export async function addNewsletterSubscriber(email: string, name?: string) {
  const [result] = await pool.execute(`
    INSERT INTO newsletter_subscribers (id, email, name, verification_token)
    VALUES (UUID(), ?, ?, UUID())
    ON DUPLICATE KEY UPDATE is_active = 1, unsubscribed_at = NULL
  `, [email, name || null]);

  return result;
}

export async function getNewsletterSubscribers(activeOnly: boolean = true) {
  const sql = activeOnly
    ? `SELECT * FROM newsletter_subscribers WHERE is_active = 1 AND is_verified = 1`
    : `SELECT * FROM newsletter_subscribers`;

  const [rows] = await pool.execute(sql);
  return rows;
}

// ============= APPOINTMENTS =============

export async function createAppointment(appointment: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type?: string;
  appointment_date: Date;
  duration_minutes?: number;
  notes?: string;
}) {
  const [result] = await pool.execute(`
    INSERT INTO appointments (id, customer_name, customer_email, customer_phone, service_type, appointment_date, duration_minutes, notes)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
  `, [
    appointment.customer_name,
    appointment.customer_email,
    appointment.customer_phone || null,
    appointment.service_type || null,
    appointment.appointment_date,
    appointment.duration_minutes || 60,
    appointment.notes || null
  ]);

  return result;
}

export async function getAppointments(filters?: { status?: string; dateFrom?: Date; dateTo?: Date }) {
  let sql = 'SELECT * FROM appointments WHERE 1=1';
  const params: any[] = [];

  if (filters?.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.dateFrom) {
    sql += ' AND appointment_date >= ?';
    params.push(filters.dateFrom);
  }

  if (filters?.dateTo) {
    sql += ' AND appointment_date <= ?';
    params.push(filters.dateTo);
  }

  sql += ' ORDER BY appointment_date ASC';

  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function updateAppointmentStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
  await pool.execute(`
    UPDATE appointments SET status = ? WHERE id = ?
  `, [status, id]);
}

// ============= SECURITY =============

export async function logSecurityEvent(event: {
  event_type: string;
  severity: 'info' | 'warning' | 'critical';
  ip_address?: string;
  user_id?: string;
  description?: string;
  user_agent?: string;
  request_path?: string;
}) {
  await pool.execute(`
    INSERT INTO security_logs (id, event_type, severity, ip_address, user_id, description, user_agent, request_path)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
  `, [
    event.event_type,
    event.severity,
    event.ip_address || null,
    event.user_id || null,
    event.description || null,
    event.user_agent || null,
    event.request_path || null
  ]);
}

export async function checkRateLimit(ipAddress: string, endpoint: string, maxRequests: number = 100, windowMinutes: number = 15): Promise<boolean> {
  // Check existing rate limit
  const [rows] = await pool.execute(`
    SELECT * FROM rate_limits 
    WHERE ip_address = ? AND endpoint = ?
      AND window_start > DATE_SUB(NOW(), INTERVAL ? MINUTE)
  `, [ipAddress, endpoint, windowMinutes]);

  if (Array.isArray(rows) && rows.length > 0) {
    const record: any = rows[0];

    if (record.is_blocked && new Date(record.blocked_until) > new Date()) {
      return false; // Still blocked
    }

    if (record.request_count >= maxRequests) {
      // Block for 1 hour
      await pool.execute(`
        UPDATE rate_limits 
        SET is_blocked = 1, blocked_until = DATE_ADD(NOW(), INTERVAL 1 HOUR)
        WHERE id = ?
      `, [record.id]);
      return false;
    }

    // Increment counter
    await pool.execute(`
      UPDATE rate_limits SET request_count = request_count + 1 WHERE id = ?
    `, [record.id]);

    return true;
  } else {
    // Create new rate limit record
    await pool.execute(`
      INSERT INTO rate_limits (id, ip_address, endpoint, request_count)
      VALUES (UUID(), ?, ?, 1)
    `, [ipAddress, endpoint]);

    return true;
  }
}

export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  const [rows] = await pool.execute(`
    SELECT * FROM ip_access_control 
    WHERE ip_address = ? AND type = 'blacklist' AND is_active = 1
  `, [ipAddress]);

  return Array.isArray(rows) && rows.length > 0;
}

export async function recordBlogPostView(postId: string, ipAddress?: string, userAgent?: string) {
  await pool.execute(`
    INSERT INTO blog_post_views (id, blog_post_id, ip_address, user_agent)
    VALUES (UUID(), ?, ?, ?)
  `, [postId, ipAddress || null, userAgent || null]);

  // Update view count
  await pool.execute(`
    UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?
  `, [postId]);
}

// Alias for backward compatibility
export const getAllBlogs = getBlogPosts;

// Kategori ekleme fonksiyonu
export async function createCategory(categoryData: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  sort_order?: number;
}) {
  try {
    console.log('Creating category with data:', categoryData);
    
    const query = `
      INSERT INTO categories (
        id, name, slug, description, icon, is_active, display_order, created_at, updated_at
      ) VALUES (
        UUID(), ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )
    `;
    
    const params = [
      categoryData.name,
      categoryData.slug,
      categoryData.description || null,
      categoryData.icon || null,
      categoryData.is_active !== undefined ? categoryData.is_active : 1,
      categoryData.sort_order || 0
    ];
    
    console.log('Executing query with params:', params);
    
    const [result] = await pool.execute(query, params);
    
    console.log('Category created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating category:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      errno: error?.errno,
      sqlState: error?.sqlState
    });
    throw error;
  }
}
