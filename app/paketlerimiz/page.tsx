"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, ArrowRight, Sparkles, Shield, Zap, HeadphonesIcon, Rocket, Award, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import type { Package } from "@/components/package-form-dialog"

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/packages")
        if (!response.ok) throw new Error("Failed to fetch packages")
        const data = await response.json()
        setPackages(data.packages || [])
      } catch (error) {
        console.error("Error fetching packages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <PageBreadcrumb
        title="Paketlerimiz"
        description="İhtiyaçlarınıza uygun en iyi çözümü bulmak için paketlerimizi inceleyin"
      />

      {/* Hero Section - Optional Badge */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-12 sm:py-16">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              <Sparkles className="mr-1 h-3 w-3" />
              Özel Fiyatlar
            </Badge>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              İhtiyaçlarınıza özel hazırlanmış paketlerimizle dijital dünyadaki yerinizi alın.
              Profesyonel destek ve kaliteli hizmet garantisi.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Güvenli & Hızlı</h3>
              <p className="text-sm text-muted-foreground">
                SSL sertifikası ve hızlı sunucularla güvenli deneyim
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <HeadphonesIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">7/24 Destek</h3>
              <p className="text-sm text-muted-foreground">
                Her zaman yanınızdayız, sorunlarınıza anında çözüm
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Hızlı Teslimat</h3>
              <p className="text-sm text-muted-foreground">
                Projenizi en kısa sürede teslim ediyoruz
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Modern Teknoloji</h3>
              <p className="text-sm text-muted-foreground">
                En güncel teknolojilerle geliştirme
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 mr-2" />
                <div className="text-4xl font-bold">500+</div>
              </div>
              <p className="text-primary-foreground/80">Mutlu Müşteri</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 mr-2" />
                <div className="text-4xl font-bold">1000+</div>
              </div>
              <p className="text-primary-foreground/80">Tamamlanan Proje</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 mr-2" />
                <div className="text-4xl font-bold">10+</div>
              </div>
              <p className="text-primary-foreground/80">Yıllık Deneyim</p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Paketlerimiz
            </h2>
            <p className="text-lg text-muted-foreground">
              Her bütçeye uygun çözümler sunuyoruz. Size en uygun paketi seçin.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Henüz paket bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto justify-items-center">
              {packages.map((pkg, index) => {
                const isRecommended = packages.length === 3 && index === 1

                return (
                  <Card
                    key={pkg.id}
                    className={`relative flex flex-col transition-all duration-300 hover:shadow-xl w-full max-w-sm ${isRecommended
                        ? "border-primary shadow-lg lg:scale-105 hover:scale-110"
                        : "border-border hover:scale-105"
                      }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Önerilen
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-8 pt-10">
                      <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                      {pkg.description && (
                        <CardDescription className="text-base">
                          {pkg.description}
                        </CardDescription>
                      )}
                      <div className="mt-6">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            {pkg.price.toLocaleString("tr-TR")}
                          </span>
                          <span className="text-2xl text-muted-foreground font-semibold">₺</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Tek seferlik ödeme</p>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 px-6">
                      <ul className="space-y-3">
                        {(() => {
                          // Handle features as either array or JSON string
                          let featuresList: string[] = []
                          if (Array.isArray(pkg.features)) {
                            featuresList = pkg.features
                          } else if (typeof pkg.features === 'string') {
                            try {
                              featuresList = JSON.parse(pkg.features)
                            } catch {
                              featuresList = pkg.features.split('\n').filter(f => f.trim())
                            }
                          }

                          return featuresList.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 group">
                              <div className="mt-0.5 rounded-full bg-primary/10 p-1 group-hover:bg-primary/20 transition-colors">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm leading-relaxed">{feature}</span>
                            </li>
                          ))
                        })()}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-6 px-6 pb-6">
                      <Button
                        asChild
                        className="w-full"
                        variant={isRecommended ? "default" : "outline"}
                        size="lg"
                      >
                        <Link href="/teklif-formu">
                          Teklif Al
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Neden Bizi Seçmelisiniz?
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Güvenilir Hizmet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yıllardır binlerce müşteriye hizmet veriyoruz. Güvenilirliğimiz referanslarımızla kanıtlanmıştır.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Hızlı Çözümler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Projelerinizi en hızlı şekilde teslim ediyor, süreçleri optimize ediyoruz.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Kaliteli İş
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Her projede en yüksek kalite standartlarını uyguluyoruz. Detaylara önem veriyoruz.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HeadphonesIcon className="h-5 w-5 text-primary" />
                    Sürekli Destek
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Proje sonrası da yanınızdayız. Sorularınıza hızlı cevap, sorunlarınıza anında çözüm.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">Özel İhtiyaçlarınız mı Var?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Paketlerimiz ihtiyaçlarınıza tam uymuyor mu? Size özel bir çözüm hazırlayalım.
              Uzman ekibimiz projenizi değerlendirip özel bir teklif sunacaktır.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/iletisim">
                  Bizimle İletişime Geçin
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link href="/teklif-formu">
                  Hemen Teklif Alın
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

