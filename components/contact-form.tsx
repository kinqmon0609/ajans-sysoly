"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react"
import { PageBreadcrumb } from "@/components/page-breadcrumb"

export function ContactForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Geçersiz E-posta",
        description: "Lütfen geçerli bir e-posta adresi girin.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to submit")

      toast({
        title: "Başarılı! 🎉",
        description: "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",
      })

      // Formu temizle
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Mesajınız gönderilemedi. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <PageBreadcrumb 
        title="İletişim" 
        description="Projeleriniz için bizimle iletişime geçin. Sorularınızı yanıtlamak için buradayız!"
      />

      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
          {/* İletişim Bilgileri */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Bize Ulaşın</h2>
              <p className="text-gray-600 text-lg mb-8">
                Aşağıdaki iletişim bilgilerimizden bize ulaşabilir veya formu doldurarak mesaj gönderebilirsiniz.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">E-posta</h3>
                  <a href="mailto:info@demovitrin.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                    info@demovitrin.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Telefon</h3>
                  <a href="tel:+905551234567" className="text-gray-600 hover:text-blue-600 transition-colors">
                    +90 555 123 45 67
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Adres</h3>
                  <p className="text-gray-600">
                    İstanbul, Türkiye
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Çalışma Saatleri</h3>
                  <p className="text-gray-600">
                    Pazartesi - Cuma: 09:00 - 18:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Mesaj Gönderin</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base font-semibold">Adınız Soyadınız *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="mt-2 h-12 border-2 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-semibold">E-posta Adresiniz *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Örn: ahmet@sirketim.com"
                  className="mt-2 h-12 border-2 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-base font-semibold">Telefon Numaranız</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="0555 123 45 67"
                  className="mt-2 h-12 border-2 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-base font-semibold">Konu *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Mesajınızın konusu"
                  className="mt-2 h-12 border-2 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-base font-semibold">Mesajınız *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Mesajınızı buraya yazın..."
                  rows={6}
                  className="mt-2 border-2 focus:border-blue-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Mesajı Gönder
                  </>
                )}
              </Button>
            </form>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

