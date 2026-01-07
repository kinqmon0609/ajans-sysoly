"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Code,
  Globe,
  CreditCard,
  Zap,
  Smartphone,
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Shield,
  Lock,
  CheckCircle,
  Star,
  Heart,
  Users,
  Settings,
  Package,
  Truck,
  Clock,
  Mail,
  Phone,
  MapPin,
  Home,
  Edit,
  Calendar,
  MessageCircle,
  BarChart2,
  Download,
  Bell,
  Cloud,
  Share2,
  PenTool,
  Layout,
  Image,
  FileText
} from "lucide-react"
import type { Page, PageContent } from "@/lib/pages-context"

const iconMap: Record<string, any> = {
  code: Code,
  globe: Globe,
  "credit-card": CreditCard,
  zap: Zap,
  smartphone: Smartphone,
  "shopping-cart": ShoppingCart,
  search: Search,
  "bar-chart": BarChart3,
  "bar-chart-2": BarChart2,
  "trending-up": TrendingUp,
  "pie-chart": PieChart,
  "line-chart": LineChart,
  activity: Activity,
  target: Target,
  award: Award,
  shield: Shield,
  lock: Lock,
  "check-circle": CheckCircle,
  star: Star,
  heart: Heart,
  users: Users,
  settings: Settings,
  package: Package,
  truck: Truck,
  clock: Clock,
  mail: Mail,
  phone: Phone,
  "map-pin": MapPin,
  edit: Edit,
  calendar: Calendar,
  "message-circle": MessageCircle,
  download: Download,
  bell: Bell,
  cloud: Cloud,
  "share-2": Share2,
  "pen-tool": PenTool,
  layout: Layout,
  image: Image,
  "file-text": FileText,
}

interface PageRendererProps {
  page: Page
}

// Animated Counter Component
function AnimatedCounter({ value, duration = 2000 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const counterRef = useRef<HTMLDivElement>(null)

  // Parse the number from value (remove '+' and other characters)
  const numericValue = parseInt(value.replace(/\D/g, '')) || 0
  const suffix = value.replace(/[0-9]/g, '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * numericValue))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isVisible, numericValue, duration])

  return (
    <div ref={counterRef} className="stat-value">
      {count}{suffix}
    </div>
  )
}

// Stil helper fonksiyonu
const getStyleClasses = (style?: any) => {
  if (!style) return ""

  const classes: string[] = []

  // Padding
  if (style.padding === "none") classes.push("py-0")
  else if (style.padding === "small") classes.push("py-8")
  else if (style.padding === "large") classes.push("py-24")
  else classes.push("py-16")

  // Margin Top
  if (style.marginTop === "small") classes.push("mt-4")
  else if (style.marginTop === "normal") classes.push("mt-8")
  else if (style.marginTop === "large") classes.push("mt-16")

  // Margin Bottom
  if (style.marginBottom === "small") classes.push("mb-4")
  else if (style.marginBottom === "normal") classes.push("mb-8")
  else if (style.marginBottom === "large") classes.push("mb-16")

  // Border Radius
  if (style.borderRadius === "small") classes.push("rounded")
  else if (style.borderRadius === "normal") classes.push("rounded-lg")
  else if (style.borderRadius === "large") classes.push("rounded-3xl")

  // Text Alignment
  if (style.alignment === "left") classes.push("text-left")
  else if (style.alignment === "right") classes.push("text-right")
  else classes.push("text-center")

  return classes.join(" ")
}

const getInlineStyles = (style?: any) => {
  if (!style) return {}

  const styles: React.CSSProperties = {}

  // Gradient kullanımı kontrolü
  if (style.useGradient && style.gradientFrom && style.gradientTo) {
    const direction = style.gradientDirection || 'to-br'
    const directionMap: Record<string, string> = {
      'to-r': 'to right',
      'to-l': 'to left',
      'to-t': 'to top',
      'to-b': 'to bottom',
      'to-br': 'to bottom right',
      'to-bl': 'to bottom left',
      'to-tr': 'to top right',
      'to-tl': 'to top left',
    }
    styles.background = `linear-gradient(${directionMap[direction]}, ${style.gradientFrom}, ${style.gradientTo})`
  } else if (style.backgroundColor) {
    styles.backgroundColor = style.backgroundColor
  }

  if (style.textColor) styles.color = style.textColor

  return styles
}

// Slider Component
function SliderSection({ section }: { section: PageContent }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = section.items || []

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  if (slides.length === 0) {
    return (
      <section className={`py-16 bg-muted/30 ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
        <div className="container mx-auto px-4">
          {section.title && <h2 className="mb-8 text-center text-3xl font-bold">{section.title}</h2>}
          <div className="aspect-[16/9] bg-muted rounded-xl flex items-center justify-center">
            <p className="text-muted-foreground">Slider için resim ekleyin</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-16 bg-muted/30 ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
      <div className="container mx-auto px-4">
        {section.title && <h2 className="mb-8 text-center text-3xl font-bold">{section.title}</h2>}
        <div className="relative group">
          {/* Slider Image */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xl">
            <img
              src={slides[currentSlide].imageUrl || "/placeholder.svg"}
              alt={slides[currentSlide].title || `Slide ${currentSlide + 1}`}
              className="h-full w-full object-cover transition-all duration-500"
            />
            {slides[currentSlide].title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white text-2xl font-bold">{slides[currentSlide].title}</h3>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export function PageRenderer({ page }: PageRendererProps) {
  const renderSection = (section: PageContent, index: number) => {
    switch (section.type) {
      case "hero":
        return (
          <section
            key={index}
            className={`relative overflow-hidden bg-gradient-to-b from-primary/5 to-background ${getStyleClasses(section.style)}`}
            style={getInlineStyles(section.style)}
          >
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-3xl text-center">
                {section.subtitle && <p className="mb-4 text-sm font-medium text-primary">{section.subtitle}</p>}
                <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  {section.title}
                </h1>
                {section.description && (
                  <p className="mb-8 text-pretty text-lg text-muted-foreground">{section.description}</p>
                )}
              </div>
            </div>
          </section>
        )

      case "features-box":
        const boxGradients = [
          { bg: "from-blue-500/10 via-cyan-500/10 to-teal-500/10", border: "from-blue-400 to-cyan-500", text: "from-blue-600 to-cyan-600" },
          { bg: "from-green-500/10 via-emerald-500/10 to-teal-500/10", border: "from-green-400 to-teal-500", text: "from-green-600 to-teal-600" },
          { bg: "from-cyan-500/10 via-blue-500/10 to-indigo-500/10", border: "from-cyan-400 to-indigo-500", text: "from-cyan-600 to-indigo-600" },
          { bg: "from-indigo-500/10 via-blue-500/10 to-cyan-500/10", border: "from-indigo-400 to-cyan-500", text: "from-indigo-600 to-cyan-600" }
        ]
        return (
          <section key={index} className={`py-20 relative overflow-hidden ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800"></div>
            <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-white/[0.02] bg-[size:40px_40px]"></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                {/* Sol Taraf - Yazı ve Buton */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="inline-block">
                      <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                        ✨ Profesyonel Çözümler
                      </span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black leading-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {section.title || "Hızlı ve Ölçeklenebilir Çözümler"}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.description || "İhtiyaçlarınıza özel tasarlanmış yazılımlarla iş süreçlerinizi optimize edin."}
                    </p>
                  </div>
                  {section.buttonText && (
                    <div className="flex gap-4">
                      <a href={section.buttonUrl || "/iletisim"} className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl"></span>
                        <span className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-pink-500 rounded-full opacity-30 group-hover:rotate-90 ease"></span>
                        <span className="relative flex items-center gap-2">
                          {section.buttonText}
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Sağ Taraf - 4 Kutu (2x2 Grid) */}
                <div className="grid grid-cols-2 gap-6">
                  {section.items?.slice(0, 4).map((item, i) => {
                    const gradient = boxGradients[i % boxGradients.length]
                    return (
                      <div key={i} className="group relative">
                        {/* Animated Border */}
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient.border} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>

                        {/* Card Content */}
                        <div className={`relative bg-gradient-to-br ${gradient.bg} backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-500 hover:transform hover:scale-105 hover:-translate-y-1`}>
                          <div className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-br ${gradient.border} flex items-center justify-center shadow-lg`}>
                            <div className="text-3xl">
                              {item.icon === "Zap" && "⚡"}
                              {item.icon === "Shield" && "🛡️"}
                              {item.icon === "Star" && "⭐"}
                              {item.icon === "Target" && "🎯"}
                              {!["Zap", "Shield", "Star", "Target"].includes(item.icon || "") && (
                                iconMap[item.icon || ""] ? <div className="h-8 w-8 text-white">{React.createElement(iconMap[item.icon || ""])}</div> : "📦"
                              )}
                            </div>
                          </div>
                          <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${gradient.text} bg-clip-text text-transparent`}>
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Decorative Blobs */}
            <div className="absolute top-10 right-10 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl"></div>
          </section>
        )

      case "features":
        return (
          <section key={index} className={`py-16 ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            <div className="container mx-auto px-4">
              {section.title && <h2 className="mb-12 text-center text-3xl font-bold">{section.title}</h2>}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {section.items?.map((item, i) => {
                  const Icon = item.icon ? iconMap[item.icon] : null
                  return (
                    <Card key={i}>
                      <CardContent className="p-6">
                        {Icon && (
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )

      case "stats":
        const statGradients = [
          "from-blue-500 via-cyan-500 to-teal-500",      // Mavi-Turkuaz
          "from-green-500 via-emerald-500 to-teal-600",  // Yeşil-Zümrüt
          "from-blue-600 via-indigo-500 to-cyan-500",    // Mavi-İndigo
          "from-cyan-500 via-blue-500 to-indigo-600"     // Cyan-Mavi
        ]
        return (
          <section key={index} className={`relative py-20 overflow-hidden bg-white ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            <div className="container mx-auto px-4 relative z-10">
              <div className="mb-16 text-center">
                {section.title && (
                  <h2 className="mb-4 text-4xl md:text-5xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                )}
                {section.description && (
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {section.description}
                  </p>
                )}
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto items-stretch">
                {section.items?.map((item, i) => {
                  const Icon = item.icon ? iconMap[item.icon] : null
                  const gradient = statGradients[i % statGradients.length]
                  return (
                    <div
                      key={i}
                      className="group relative h-full"
                    >
                      {/* Glow Effect */}
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>

                      {/* Card */}
                      <div className="relative h-full bg-white backdrop-blur-xl p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-500 hover:transform hover:scale-105 shadow-lg">
                        {Icon && (
                          <div className="mb-6 flex justify-center">
                            <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                              <Icon className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        )}

                        <div className={`mb-3 text-5xl md:text-6xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent text-center`}>
                          <AnimatedCounter value={item.value || "0"} duration={2500} />
                        </div>

                        <div className="text-gray-700 text-lg font-medium text-center">
                          {item.label}
                        </div>

                        {/* Decorative Line */}
                        <div className={`mt-6 h-1 w-20 mx-auto rounded-full bg-gradient-to-r ${gradient}`}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )

      case "content":
        return (
          <section key={index} className={`py-20 relative overflow-hidden ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            {/* Subtle Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="mx-auto max-w-4xl">
                {section.title && (
                  <div className="mb-8 text-center">
                    <div className="inline-block mb-4">
                      <div className="h-1 w-20 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full mx-auto"></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                      {section.title}
                    </h2>
                  </div>
                )}
                {section.content && (
                  <div className="prose prose-lg md:prose-xl max-w-none">
                    <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 text-center md:text-left">
                      {section.content}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/20 dark:bg-violet-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
          </section>
        )

      case "slider":
        return <SliderSection key={index} section={section} />

      case "image":
        return (
          <section key={index} className={`py-16 ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            <div className="container mx-auto px-4">
              {section.title && <h2 className="mb-6 text-3xl font-bold text-center">{section.title}</h2>}
              <div className="mx-auto max-w-4xl">
                {section.imageUrl ? (
                  <img
                    src={section.imageUrl}
                    alt={section.title || "Resim"}
                    className="w-full rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Resim yükleniyor...</p>
                  </div>
                )}
                {section.description && (
                  <p className="mt-6 text-center text-muted-foreground">{section.description}</p>
                )}
              </div>
            </div>
          </section>
        )

      case "marquee":
        const animationSpeed = section.animationSpeed || 20 // Varsayılan 20 saniye
        return (
          <section
            key={index}
            className={`overflow-hidden ${getStyleClasses(section.style)}`}
            style={getInlineStyles(section.style)}
          >
            <div
              className="whitespace-nowrap"
              style={{
                animation: `marquee ${animationSpeed}s linear infinite`,
                display: 'inline-block'
              }}
            >
              <span className="mx-8 text-2xl font-bold">
                {section.content || "Kayan yazı metni buraya gelecek"}
              </span>
              <span className="mx-8 text-2xl font-bold">
                {section.content || "Kayan yazı metni buraya gelecek"}
              </span>
              <span className="mx-8 text-2xl font-bold">
                {section.content || "Kayan yazı metni buraya gelecek"}
              </span>
            </div>
          </section>
        )

      case "gallery":
        return (
          <section key={index} className={`py-16 ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            <div className="container mx-auto px-4">
              {section.title && <h2 className="mb-12 text-center text-3xl font-bold">{section.title}</h2>}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {section.items && section.items.length > 0 ? (
                  section.items.map((item, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
                      <img
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.title || "Galeri resmi"}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      {item.title && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                          <p className="text-white font-semibold">{item.title}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-muted-foreground py-12">
                    Galeri resimleri yükleniyor...
                  </div>
                )}
              </div>
            </div>
          </section>
        )

      case "video":
        return (
          <section key={index} className={`py-16 bg-muted/30 ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            <div className="container mx-auto px-4">
              {section.title && <h2 className="mb-6 text-center text-3xl font-bold">{section.title}</h2>}
              <div className="mx-auto max-w-4xl">
                {section.videoUrl ? (
                  <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      src={section.videoUrl}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Video yükleniyor...</p>
                  </div>
                )}
                {section.description && (
                  <p className="mt-6 text-center text-muted-foreground">{section.description}</p>
                )}
              </div>
            </div>
          </section>
        )

      case "container":
        return (
          <section key={index} className={`py-16 ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            <div className="container mx-auto px-4">
              {section.title && <h2 className="mb-8 text-center text-3xl font-bold">{section.title}</h2>}
              <div className="space-y-6">
                {section.children && section.children.length > 0 ? (
                  section.children.map((child, childIndex) => renderSection(child, childIndex))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Container boş
                  </div>
                )}
              </div>
            </div>
          </section>
        )

      case "columns":
        const colCount = section.columns?.length || 2
        const gridColsClass = colCount === 2 ? "md:grid-cols-2" : colCount === 3 ? "md:grid-cols-3" : "md:grid-cols-4"
        const columnGradients = [
          { border: "from-violet-400 to-purple-500", bg: "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30" },
          { border: "from-cyan-400 to-blue-500", bg: "from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30" },
          { border: "from-rose-400 to-pink-500", bg: "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30" },
          { border: "from-amber-400 to-orange-500", bg: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30" }
        ]
        return (
          <section key={index} className={`py-20 relative ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            <div className="container mx-auto px-4">
              {section.title && (
                <div className="mb-16 text-center">
                  <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-4">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                      {section.description}
                    </p>
                  )}
                </div>
              )}
              <div className={`grid grid-cols-1 ${gridColsClass} gap-8 items-stretch`}>
                {section.columns?.map((col, colIndex) => {
                  const gradient = columnGradients[colIndex % columnGradients.length]
                  return (
                    <div key={col.id} className="group relative h-full">
                      {/* Glow Effect */}
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient.border} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>

                      {/* Card */}
                      <div className={`relative h-full bg-gradient-to-br ${gradient.bg} backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 hover:transform hover:scale-105 transition-all duration-500`}>
                        {/* Icon or Image */}
                        {col.imageUrl && (
                          <div className="mb-6 overflow-hidden rounded-xl">
                            <img
                              src={col.imageUrl}
                              alt={col.title || "Kolon resmi"}
                              className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        )}

                        {!col.imageUrl && col.title && (
                          <div className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${gradient.border} flex items-center justify-center shadow-lg`}>
                            <span className="text-2xl font-black text-white">{colIndex + 1}</span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="space-y-4">
                          {col.title && (
                            <h3 className={`text-2xl font-bold bg-gradient-to-r ${gradient.border} bg-clip-text text-transparent`}>
                              {col.title}
                            </h3>
                          )}
                          {col.description && (
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              {col.description}
                            </p>
                          )}
                          {col.content && (
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                              {col.content}
                            </div>
                          )}

                          {/* Kolon içindeki widget'lar */}
                          {col.children && col.children.length > 0 && (
                            <div className="mt-6 space-y-6">
                              {col.children.map((child, childIndex) => renderSection(child, childIndex))}
                            </div>
                          )}
                        </div>

                        {/* Bottom Accent */}
                        <div className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r ${gradient.border}`}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )

      case "faq":
        return (
          <section key={index} className={`py-16 ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            <div className="container mx-auto px-4 max-w-3xl">
              {section.title && <h2 className="mb-4 text-center text-3xl font-bold">{section.title}</h2>}
              {section.description && <p className="mb-12 text-center text-lg text-muted-foreground">{section.description}</p>}

              <Accordion type="single" collapsible className="w-full space-y-4">
                {section.items?.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border rounded-lg px-6 bg-card"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-semibold text-lg">{item.question || item.title}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-2 text-muted-foreground leading-relaxed">
                      {item.answer || item.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )

      case "service-cards":
        return (
          <section key={index} className={`py-20 relative overflow-hidden ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
            <div className="absolute inset-0 bg-grid-slate-900/[0.02] bg-[size:60px_60px]"></div>

            <div className="container mx-auto px-4 relative z-10">
              {section.title && (
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-xl text-gray-600">{section.description}</p>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.items?.map((item, i) => {
                  const gradients = [
                    "from-blue-500 to-cyan-500",
                    "from-green-500 to-emerald-500",
                    "from-cyan-500 to-blue-500",
                    "from-teal-500 to-green-500",
                    "from-indigo-500 to-blue-500",
                    "from-emerald-500 to-teal-500"
                  ]
                  const gradient = gradients[i % gradients.length]

                  return (
                    <a
                      key={i}
                      href={item.url || "#"}
                      className="group relative block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Gradient Border Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      <div className="absolute inset-[2px] bg-white rounded-2xl"></div>

                      {/* Content */}
                      <div className="relative p-8">
                        {/* Icon */}
                        <div className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <div className="text-3xl text-white">
                            {item.icon === "Code" && "💻"}
                            {item.icon === "ShoppingCart" && "🛒"}
                            {item.icon === "Smartphone" && "📱"}
                            {item.icon === "Palette" && "🎨"}
                            {item.icon === "TrendingUp" && "📈"}
                            {item.icon === "PenTool" && "✏️"}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed mb-6">
                          {item.description}
                        </p>

                        {/* Arrow Icon */}
                        <div className="flex items-center text-blue-600 font-semibold">
                          <span>Detaylı Bilgi</span>
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          </section>
        )

      case "pricing":
        return (
          <section key={index} className={`py-20 bg-gradient-to-b from-gray-50 to-white ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            <div className="container mx-auto px-4">
              {section.title && (
                <div className="text-center mb-4">
                  <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {section.title}
                  </h2>
                </div>
              )}
              {section.description && (
                <p className="text-xl text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                  {section.description}
                </p>
              )}

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {section.items?.map((item, i) => (
                  <div
                    key={i}
                    className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 ${item.featured ? 'ring-2 ring-blue-500 scale-105 z-10' : ''
                      }`}
                  >
                    {item.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Popüler
                      </div>
                    )}

                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{item.title}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-black text-gray-900">{item.price}</span>
                      {item.period && <span className="text-gray-600 ml-1">/{item.period}</span>}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {item.features?.map((feature, fi) => (
                        <li key={fi} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={item.buttonUrl || '/randevu'}
                      className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${item.featured
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:scale-105'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                    >
                      {item.buttonText || 'Hemen Başla'}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case "cta":
        return (
          <section key={index} className={`relative py-24 overflow-hidden ${getStyleClasses(section.style)}`} style={getInlineStyles(section.style)}>
            {/* Modern Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700"></div>
            <div className="absolute inset-0 bg-grid-white/[0.08] bg-[size:50px_50px]"></div>

            {/* Animated Shapes */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                {section.title && (
                  <h2 className="mb-6 text-4xl md:text-6xl font-black text-white leading-tight">
                    {section.title}
                  </h2>
                )}
                {section.description && (
                  <p className="mb-10 text-xl md:text-2xl text-emerald-50/90 max-w-2xl mx-auto leading-relaxed">
                    {section.description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a
                    href={section.buttonUrl || "/iletisim"}
                    className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-teal-900 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white rounded-xl overflow-hidden"
                  >
                    <span className="absolute inset-0 w-full h-full bg-white"></span>
                    <span className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-emerald-500 rounded-full opacity-30 group-hover:rotate-90 ease"></span>
                    <span className="relative flex items-center gap-3">
                      <span>{section.buttonText || section.content || "İletişime Geçin"}</span>
                      <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </a>

                  <a
                    href="/hakkimizda"
                    className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white border-2 border-white/30 hover:border-white/60 rounded-xl transition-all duration-200 backdrop-blur-sm hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2">
                      Daha Fazla Bilgi
                      <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </a>
                </div>

                {/* Social Proof or Trust Badges */}
                <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>500+ Mutlu Müşteri</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>%98 Memnuniyet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span>24/7 Destek</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )

      default:
        return null
    }
  }

  // Güvenli array kontrolü - MySQL JSON formatını destekle
  let content = [];

  if (Array.isArray(page.content)) {
    // Eğer zaten array ise
    content = page.content;
  } else if (page.content && page.content.sections && Array.isArray(page.content.sections)) {
    // MySQL JSON formatı: {sections: [...]}
    content = page.content.sections;
  } else {
    // Boş array
    content = [];
  }

  // İçerikten hero section'ları filtrele (çünkü üstte kendi header'ımız var)
  const filteredContent = content.filter(section => section.type !== 'hero')

  return (
    <div className="min-h-screen">
      {/* Page Header with Breadcrumb - Centered */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Breadcrumb - Centered */}
            <div className="mb-6 flex justify-center">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/" className="flex items-center gap-1 hover:text-primary">
                        <Home className="h-4 w-4" />
                        Ana Sayfa
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">{page.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Page Title - Centered */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                {page.title}
              </h1>
              {page.description && (
                <p className="text-base text-muted-foreground md:text-lg">
                  {page.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Content - Hero sections filtered out */}
      <div>{filteredContent.map((section, index) => renderSection(section, index))}</div>
    </div>
  )
}
