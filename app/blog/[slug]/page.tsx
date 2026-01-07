import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Clock } from "lucide-react"

// Static export için gerekli
export async function generateStaticParams() {
  return [
    { slug: 'web-tasarim-trendleri-2024' },
    { slug: 'mobil-uygulama-gelistirme' },
    { slug: 'e-ticaret-cozumleri' }
  ]
}

interface BlogPost {
  id: string
  title: string
  slug: string
  category: string
  description: string
  content: any[]
  image: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  is_active: boolean
  created_at: string
  updated_at: string
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3004"}/api/blog/${slug}`,
      { cache: "no-store" }
    )
    
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return null
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const post = await getBlogPost(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Blog'a Dön
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-xl shadow-sm border p-8">
          {/* Meta Info */}
          <div className="flex items-center space-x-4 text-sm text-slate-600 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(post.created_at).toLocaleDateString('tr-TR')}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              Admin
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              5 dk okuma
            </div>
          </div>

          {/* Category */}
          <Badge variant="secondary" className="mb-4">
            {post.category}
          </Badge>

          {/* Title */}
          <h1 className="text-4xl font-bold text-slate-800 mb-6">
            {post.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            {post.description}
          </p>

          {/* Featured Image */}
          {post.image && (
            <div className="mb-8">
              <Image
                src={post.image}
                alt={post.title}
                width={800}
                height={400}
                className="w-full h-64 object-cover rounded-lg shadow-sm"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {post.content && Array.isArray(post.content) ? (
              post.content.map((block, index) => {
                if (block.type === 'heading') {
                  const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements
                  return (
                    <HeadingTag key={index} className="text-2xl font-bold text-slate-800 mt-8 mb-4">
                      {block.text || block.content}
                    </HeadingTag>
                  )
                } else if (block.type === 'paragraph') {
                  return (
                    <p key={index} className="text-slate-700 leading-relaxed mb-4">
                      {block.text || block.content}
                    </p>
                  )
                }
                return null
              })
            ) : (
              <p className="text-slate-700 leading-relaxed">
                Blog içeriği yükleniyor...
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <Link href="/blog">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Tüm Yazılar
                </Button>
              </Link>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Paylaş
                </Button>
                <Button variant="outline" size="sm">
                  Beğen
                </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}