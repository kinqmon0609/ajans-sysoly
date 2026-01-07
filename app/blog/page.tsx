"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, Clock, Tag, FolderOpen } from "lucide-react"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image: string | null
  author: string
  published_at: string
  reading_time: number
  category_name?: string
  category_slug?: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          fetch("/api/blog?published=true"),
          fetch("/api/blog/categories"),
        ])
        const postsData = await postsRes.json()
        const categoriesData = await categoriesRes.json()
        
        setPosts(postsData.posts || [])
        setCategories(categoriesData.categories || [])
      } catch (error) {
        console.error("Blog verileri yükleme hatası:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((post) => post.category_slug === selectedCategory)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <PageBreadcrumb
          title="Blog"
          description="Yazılım, tasarım ve dijital dünyadan haberler, ipuçları ve güncellemeler"
        />

        <section className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setSelectedCategory}
            >
              {/* Categories Filter */}
              <TabsList className="mb-8 flex-wrap h-auto gap-2">
                <TabsTrigger value="all" className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Tümü ({posts.length})
                </TabsTrigger>
                {categories.map((category) => {
                  const count = posts.filter(
                    (p) => p.category_slug === category.slug
                  ).length
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.slug}
                      className="gap-2"
                    >
                      {category.name} ({count})
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {/* Posts Grid */}
              <TabsContent value={selectedCategory} className="mt-0">
                {filteredPosts.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`}>
                        <Card className="h-full transition-all hover:shadow-xl hover:-translate-y-1 group overflow-hidden">
                          {post.cover_image && (
                            <div className="relative aspect-video overflow-hidden">
                              <Image
                                src={post.cover_image}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              {post.category_name && (
                                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-lg">
                                  <FolderOpen className="mr-1 h-3 w-3" />
                                  {post.category_name}
                                </Badge>
                              )}
                            </div>
                          )}
                          <CardHeader className="space-y-3">
                            <CardTitle className="text-balance line-clamp-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(post.published_at).toLocaleDateString(
                                    "tr-TR",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                              <span>•</span>
                              <span>{post.author}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{post.reading_time} dk</span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground leading-relaxed line-clamp-3">
                              {post.excerpt}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      Bu kategoride henüz blog yazısı yok
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </section>
      </main>
    </div>
  )
}
