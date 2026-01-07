"use client"

import { useState, useMemo, useEffect } from "react"
import { AdminEditBar } from "@/components/admin-edit-bar"
import { DemoCard } from "@/components/demo-card"
import { TestimonialsSection } from "@/components/testimonials-section"
import { HomepagePopup } from "@/components/homepage-popup"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDemos } from "@/lib/demo-context"
import { Search, Loader2, SlidersHorizontal } from "lucide-react"
import ServicePagesWidget from "@/components/service-pages-widget"

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

export default function HomePage() {
  const { demos, loading } = useDemos()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [priceRange, setPriceRange] = useState<string>("all")
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(Array.isArray(data) ? data : [])
        } else {
          console.warn("Categories could not be loaded. Using default categories.")
          setCategories([])
        }
      } catch (error) {
        console.error("Kategoriler yükleme hatası:", error)
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const filteredDemos = useMemo(() => {
    const filtered = demos.filter((demo) => {
      const matchesSearch =
        demo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        demo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (demo.technologies && demo.technologies.length > 0 && demo.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase())))
      const matchesCategory = selectedCategory === "Tümü" || demo.category === selectedCategory
      const isActive = demo.is_active

      let matchesPrice = true
      if (priceRange === "0-5000") {
        matchesPrice = demo.price <= 5000
      } else if (priceRange === "5000-10000") {
        matchesPrice = demo.price > 5000 && demo.price <= 10000
      } else if (priceRange === "10000+") {
        matchesPrice = demo.price > 10000
      }

      return matchesSearch && matchesCategory && matchesPrice && isActive
    })

    // Sıralama
    if (sortBy === "newest") {
      filtered.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.title.localeCompare(b.title, "tr"))
    }

    return filtered
  }, [demos, searchQuery, selectedCategory, sortBy, priceRange])

  return (
    <>
      <AdminEditBar />
      <HomepagePopup />
      <div>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-6xl">Modern Web Çözümleri</h1>
              <p className="mb-8 text-lg text-muted-foreground leading-relaxed md:text-xl">
                İşletmeniz için özel tasarlanmış, profesyonel ve kullanıcı dostu web siteleri. Demolarımızı inceleyin ve
                size en uygun çözümü bulun.
              </p>

              {/* Search Bar */}
              <div className="relative mx-auto max-w-xl">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Demo, teknoloji veya özellik ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="border-b border-border bg-background">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance md:text-4xl">Hizmetlerimiz</h2>
              <p className="text-muted-foreground leading-relaxed">
                Modern teknolojiler kullanarak işletmeniz için en uygun dijital çözümleri sunuyoruz
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Web Tasarım</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Kullanıcı deneyimini ön planda tutan, modern ve responsive web tasarımları
                </p>
              </div>

              <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Web Geliştirme</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  React, Next.js ve modern teknolojilerle hızlı ve güvenli web uygulamaları
                </p>
              </div>

              <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">E-Ticaret</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Güvenli ödeme sistemleri ve stok yönetimi ile tam özellikli e-ticaret siteleri
                </p>
              </div>

              <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Mobil Uyumlu</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tüm cihazlarda mükemmel görünen, mobil öncelikli tasarım yaklaşımı
                </p>
              </div>

              <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Performans</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hızlı yükleme süreleri ve optimize edilmiş kod yapısı ile üstün performans
                </p>
              </div>

              <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Güvenlik</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  SSL sertifikası, güvenli veri tabanı ve modern güvenlik standartları
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="border-b border-border bg-background">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant={selectedCategory === "Tümü" ? "default" : "outline"}
                onClick={() => setSelectedCategory("Tümü")}
                size="sm"
              >
                Tümü
              </Button>
              {loadingCategories ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.name)}
                    size="sm"
                  >
                    {category.icon && <span className="mr-1">{category.icon}</span>}
                    {category.name}
                  </Button>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Advanced Filters */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtreler {showFilters ? "Gizle" : "Göster"}
              </Button>

              <div
                className={`flex flex-col gap-4 md:flex-row md:items-center ${showFilters ? "flex" : "hidden md:flex"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sırala:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">En Yeni</SelectItem>
                      <SelectItem value="price-low">Fiyat (Düşük-Yüksek)</SelectItem>
                      <SelectItem value="price-high">Fiyat (Yüksek-Düşük)</SelectItem>
                      <SelectItem value="name">İsim (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Fiyat:</span>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="0-5000">0 - 5.000 ₺</SelectItem>
                      <SelectItem value="5000-10000">5.000 - 10.000 ₺</SelectItem>
                      <SelectItem value="10000+">10.000 ₺+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">{filteredDemos.length} demo bulundu</div>
            </div>
          </div>
        </section>

        {/* Demo Grid */}
        <section className="container mx-auto px-4 py-16">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDemos.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">Aradığınız kriterlere uygun demo bulunamadı.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDemos.map((demo) => (
                <DemoCard key={demo.id} demo={demo} />
              ))}
            </div>
          )}
        </section>

        <TestimonialsSection />

        {/* Randevu CTA Section */}
        <section className="border-t border-border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <div className="container mx-auto px-4 py-20">
            <div className="mx-auto max-w-4xl">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-12 shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10"></div>
                
                <div className="relative z-10 text-center text-white">
                  <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white/20 p-4">
                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                    Ücretsiz Danışmanlık Randevusu Alın
                  </h2>
                  <p className="mb-8 text-lg text-white/90">
                    Projeniz hakkında konuşalım! Size en uygun tarihi seçin, ekibimiz sizinle iletişime geçsin.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-green-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all text-base px-8 py-6"
                    >
                      <a href="/randevu" className="flex items-center gap-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Hemen Randevu Al
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-2 border-white bg-transparent text-white hover:bg-white/10 text-base px-8 py-6"
                    >
                      <a href="/iletisim">Bize Ulaşın</a>
                    </Button>
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Ücretsiz Danışmanlık</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Hızlı Geri Dönüş</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Esnek Saatler</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 py-16">
            <div className="grid gap-8 text-center md:grid-cols-3">
              <div>
                <div className="mb-2 text-4xl font-bold">{demos.filter((d) => d.is_active).length}+</div>
                <div className="text-sm text-muted-foreground">Hazır Demo</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold">100+</div>
                <div className="text-sm text-muted-foreground">Mutlu Müşteri</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold">5+</div>
                <div className="text-sm text-muted-foreground">Yıllık Deneyim</div>
              </div>
            </div>
          </div>
        </section>

        {/* Hizmet Sayfaları Bölümü */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Hizmetlerimiz
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Size en uygun çözümü sunmak için geniş bir hizmet yelpazesi sunuyoruz. 
                Her projeye özel yaklaşım ve kaliteli hizmet garantisi.
              </p>
            </div>
            
            <ServicePagesWidget 
              showActions={false} 
              limit={6} 
              className="max-w-7xl mx-auto"
            />
            
            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <a href="/paketlerimiz">Tüm Hizmetleri Gör</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
