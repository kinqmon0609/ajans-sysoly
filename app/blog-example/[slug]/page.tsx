/**
 * Blog Detail Page Example
 * - SEO-friendly metadata
 * - Static generation
 * - Turkish character support
 */

import { notFound } from 'next/navigation'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Clock, Tag } from 'lucide-react'
import { generateSEOMetadata, truncate, calculateReadingTime } from '@/lib/seo-helpers'
import { getAllBlogPosts, getBlogPostBySlug, getRelatedBlogPosts } from '@/lib/blog-data'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}


// ✅ Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  
  if (!post) {
    return generateSEOMetadata({
      title: 'Blog Yazısı Bulunamadı',
      description: 'Aradığınız blog yazısı bulunamadı',
      url: `/blog/${slug}`,
    })
  }

  return generateSEOMetadata({
    title: post.title,
    description: truncate(post.excerpt, 160),
    keywords: [post.category, ...post.tags],
    image: post.coverImage,
    url: `/blog/${slug}`,
    type: 'article',
    publishedTime: new Date(post.publishedAt).toISOString(),
    modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    author: post.author,
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedBlogPosts(post, 3)
  const readingTime = calculateReadingTime(post.content)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Blog'a Dön
        </Link>

        {/* Cover Image */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-8">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{readingTime} dakika okuma</span>
          </div>
        </div>

        {/* Content */}
        <article 
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-12">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted hover:bg-muted/80 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-12 border-t">
            <h2 className="text-2xl font-bold mb-6">İlgili Yazılar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg mb-3">
                    <Image
                      src={relatedPost.coverImage}
                      alt={relatedPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {truncate(relatedPost.excerpt, 100)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



