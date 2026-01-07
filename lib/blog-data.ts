/**
 * Blog Posts Data
 * - Slug auto-generated from title
 * - Add new posts here and they'll automatically appear
 */

import { slugify, calculateReadingTime } from './seo-helpers'

export interface BlogPost {
  id: string
  title: string
  slug?: string
  excerpt: string
  content: string
  coverImage: string
  author: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt?: string
}

const rawBlogPosts: Omit<BlogPost, 'slug'>[] = [
  {
    id: '1',
    title: 'Modern Web Tasarım Trendleri 2024',
    excerpt: 'Bu yıl web tasarımda öne çıkan trendleri ve gelecek yıl için tahminlerimizi keşfedin.',
    content: `
# Modern Web Tasarım Trendleri 2024

Web tasarım dünyası sürekli evrim geçiriyor. Bu yazıda 2024 yılında öne çıkan trendleri inceleyeceğiz.

## 1. Minimalist Tasarım
Sadelik ve işlevsellik bir arada...

## 2. Dark Mode
Kullanıcı tercihlerine göre tema değiştirme...

## 3. Mikro-animasyonlar
Kullanıcı deneyimini zenginleştiren küçük detaylar...
    `,
    coverImage: '/blog/web-design-trends-2024.jpg',
    author: 'Ahmet Yılmaz',
    category: 'Web Tasarım',
    tags: ['web design', 'trends', 'UI/UX'],
    publishedAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    title: 'E-Ticaret SEO Stratejileri',
    excerpt: 'E-ticaret sitenizin arama motorlarında üst sıralara çıkması için ipuçları.',
    content: `
# E-Ticaret SEO Stratejileri

E-ticaret sitelerinde SEO, organik trafik kazanmanın en önemli yoludur.

## Ürün Sayfası Optimizasyonu
- Benzersiz ürün açıklamaları
- Yüksek kaliteli görseller
- Yapılandırılmış veri işaretlemesi

## Teknik SEO
- Sayfa hızı optimizasyonu
- Mobil uyumluluk
- Güvenli (HTTPS) bağlantı
    `,
    coverImage: '/blog/ecommerce-seo.jpg',
    author: 'Zeynep Kaya',
    category: 'SEO',
    tags: ['seo', 'e-commerce', 'digital marketing'],
    publishedAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'React ile Hızlı Web Uygulamaları Geliştirme',
    excerpt: 'React kullanarak performanslı ve modern web uygulamaları nasıl geliştirilir?',
    content: `
# React ile Hızlı Web Uygulamaları

React, modern web uygulamaları geliştirmek için en popüler kütüphanelerden biri.

## React'in Avantajları
1. Component-based architecture
2. Virtual DOM
3. Geniş ekosistem

## Performans İpuçları
- Code splitting
- Lazy loading
- Memoization
    `,
    coverImage: '/blog/react-development.jpg',
    author: 'Can Demir',
    category: 'Yazılım',
    tags: ['react', 'javascript', 'web development'],
    publishedAt: '2024-01-05',
  },
]

// Auto-generate slugs
export const blogPosts: BlogPost[] = rawBlogPosts.map(post => ({
  ...post,
  slug: post.slug || slugify(post.title),
}))

/**
 * Get all blog posts
 */
export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

/**
 * Get blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

/**
 * Get blog posts by category
 */
export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category)
}

/**
 * Get blog posts by tag
 */
export function getBlogPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post => post.tags.includes(tag))
}

/**
 * Get related blog posts (same category, different post)
 */
export function getRelatedBlogPosts(currentPost: BlogPost, limit: number = 3): BlogPost[] {
  return blogPosts
    .filter(post => 
      post.id !== currentPost.id && 
      post.category === currentPost.category
    )
    .slice(0, limit)
}



