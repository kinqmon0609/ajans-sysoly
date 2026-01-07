import { type NextRequest, NextResponse } from "next/server"

// generateStaticParams kaldırıldı - PUT request'leri için gerekli

import { getBlogPostBySlug, getBlogPostById, updateBlogPost, deleteBlogPost, incrementBlogViewCount, getBlogPostTags, getRelatedBlogPosts, setBlogPostTags } from "@/lib/mysql/queries"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    
    // Try to find by slug first, if not found try by ID
    let post = await getBlogPostBySlug(slug)
    
    if (!post) {
      post = await getBlogPostById(slug)
    }

    if (!post) {
      return NextResponse.json({ error: "Blog yazısı bulunamadı" }, { status: 404 })
    }
    
    // Get tags
    const tags = await getBlogPostTags(post.id)
    post.tags = tags
    
    // Get related posts
    if (post.category_id) {
      const relatedPosts = await getRelatedBlogPosts(post.id, post.category_id, 3)
      post.relatedPosts = relatedPosts
    }
    
    // Increment view count
    await incrementBlogViewCount(post.id)

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Blog yazısı yükleme hatası:", error)
    return NextResponse.json({ error: "Blog yazısı bulunamadı" }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await request.json()
    
    // Find post by slug or ID
    let post = await getBlogPostBySlug(slug)
    if (!post) {
      post = await getBlogPostById(slug)
    }
    
    if (!post) {
      return NextResponse.json({ error: "Blog yazısı bulunamadı" }, { status: 404 })
    }

    // Update tags if provided
    if (body.tagIds) {
      await setBlogPostTags(post.id, body.tagIds)
      delete body.tagIds // Remove from body as it's not a column in blog_posts
    }

    await updateBlogPost(post.id, body)
    const updatedPost = await getBlogPostById(post.id)

    return NextResponse.json({ post: updatedPost, success: true })
  } catch (error) {
    console.error("Blog yazısı güncelleme hatası:", error)
    return NextResponse.json({ error: "Blog yazısı güncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    
    // Find post by slug or ID
    let post = await getBlogPostBySlug(slug)
    if (!post) {
      post = await getBlogPostById(slug)
    }
    
    if (!post) {
      return NextResponse.json({ error: "Blog yazısı bulunamadı" }, { status: 404 })
    }

    await deleteBlogPost(post.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Blog yazısı silme hatası:", error)
    return NextResponse.json({ error: "Blog yazısı silinemedi" }, { status: 500 })
  }
}
