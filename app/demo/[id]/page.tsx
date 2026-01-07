import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowLeft, 
  ExternalLink, 
  Eye, 
  Calendar,
  DollarSign,
  Play,
  MessageSquare,
  Download
} from "lucide-react"

// Static export için gerekli
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ]
}

interface Demo {
  id: string
  title: string
  description: string
  category: string
  price: number
  demo_url: string
  is_active: boolean
  images: string[]
  features: string[]
  technologies: string[]
  created_at: string
  updated_at: string
}

async function getDemo(id: string): Promise<Demo | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3004"}/api/demos/${id}`,
      { cache: "no-store" }
    )
    
    if (!response.ok) return null
    const data = await response.json()
    return data.demo || null
  } catch (error) {
    console.error("Error fetching demo:", error)
    return null
  }
}

export default async function DemoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const demo = await getDemo(resolvedParams.id)

  if (!demo) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/demolarimiz">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Badge variant="secondary" className="mb-3">
                    {demo.category}
                  </Badge>
                  <h1 className="text-3xl font-bold text-slate-800 mb-4">
                    {demo.title}
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {demo.description}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ₺{demo.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Demo Link */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Canlı Demo</h3>
                    <p className="text-slate-600 text-sm">Projeyi canlı olarak inceleyin</p>
                  </div>
                  <a
                    href={demo.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Demo'yu Görüntüle
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>

              {/* Images */}
              {demo.images && demo.images.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800">Proje Görselleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {demo.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={image}
                          alt={`${demo.title} - Görsel ${index + 1}`}
                          width={600}
                          height={400}
                          className="w-full h-64 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Özellikler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demo.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Kullanılan Teknolojiler</h3>
              <div className="flex flex-wrap gap-3">
                {demo.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    ₺{demo.price.toLocaleString()}
                  </div>
                  <p className="text-slate-600 mb-4">Başlangıç fiyatı</p>
                  <Button className="w-full" size="lg">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Teklif Al
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Proje Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Kategori</span>
                    <Badge variant="secondary">{demo.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Durum</span>
                    <Badge variant={demo.is_active ? "default" : "secondary"}>
                      {demo.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Oluşturulma</span>
                    <span className="text-slate-800">
                      {new Date(demo.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-4">İletişim</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Bu proje hakkında daha fazla bilgi almak için bizimle iletişime geçin.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mesaj Gönder
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Teklif İndir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}