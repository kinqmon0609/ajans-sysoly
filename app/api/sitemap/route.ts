import { NextResponse } from "next/server";

import { getAllBlogs } from "@/lib/mysql/queries";

export async function GET() {
  try {
    const blogs = await getAllBlogs();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    
    // Static pages
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/blog', priority: 0.9, changefreq: 'daily' },
      { url: '/hakkimizda', priority: 0.8, changefreq: 'monthly' },
      { url: '/iletisim', priority: 0.8, changefreq: 'monthly' },
      { url: '/paketlerimiz', priority: 0.9, changefreq: 'weekly' },
      { url: '/demolarimiz', priority: 0.9, changefreq: 'weekly' },
      { url: '/teklif-formu', priority: 0.9, changefreq: 'monthly' },
      { url: '/sss', priority: 0.7, changefreq: 'monthly' },
    ];

    // Blog posts
    const blogPages = (blogs as any[])
      .filter(blog => blog.is_published)
      .map(blog => ({
        url: `/blog/${blog.slug}`,
        priority: 0.7,
        changefreq: 'weekly',
        lastmod: blog.updated_at || blog.created_at
      }));

    const allPages = [...staticPages, ...blogPages];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      }
    });

  } catch (error) {
    console.error("Sitemap generation error:", error);
    return NextResponse.json(
      { error: "Sitemap oluşturulamadı" },
      { status: 500 }
    );
  }
}

