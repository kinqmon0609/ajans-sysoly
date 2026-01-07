"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageSquare, Loader2, CheckCircle, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react"
import { tr } from "date-fns/locale"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Calendar'ı client-side only olarak import et
const Calendar = dynamic(
  () => import("@/components/ui/calendar").then((mod) => mod.Calendar),
  { ssr: false, loading: () => <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div> }
)

interface TimeSlot {
  time: string
  available: boolean
}

const STEPS = [
  { id: 1, title: "Hizmet", icon: Sparkles, description: "Hangi hizmeti almak istersiniz?" },
  { id: 2, title: "Tarih & Saat", icon: CalendarIcon, description: "Uygun tarihi seçin" },
  { id: 3, title: "Bilgileriniz", icon: User, description: "İletişim bilgileriniz" },
  { id: 4, title: "Proje Detayları", icon: MessageSquare, description: "Projeniz hakkında (opsiyonel)" },
  { id: 5, title: "Onay", icon: CheckCircle, description: "Randevu özetiniz" },
]

const SERVICES = [
  { value: "web-tasarim", label: "Web Tasarım", description: "Kurumsal web siteleri ve landing page", icon: "🌐", color: "from-blue-500 to-cyan-500" },
  { value: "e-ticaret", label: "E-Ticaret", description: "Online mağaza ve satış platformları", icon: "🛒", color: "from-purple-500 to-pink-500" },
  { value: "mobil-uygulama", label: "Mobil Uygulama", description: "iOS & Android uygulamaları", icon: "📱", color: "from-green-500 to-emerald-500" },
  { value: "seo", label: "SEO Danışmanlığı", description: "Arama motoru optimizasyonu", icon: "📈", color: "from-orange-500 to-red-500" },
  { value: "sosyal-medya", label: "Sosyal Medya", description: "Sosyal medya yönetimi ve reklam", icon: "📣", color: "from-pink-500 to-rose-500" },
  { value: "diger", label: "Diğer", description: "Özel projeniz için görüşelim", icon: "💡", color: "from-yellow-500 to-amber-500" },
]

export default function RandevuPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    service_type: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    notes: "",
    // Proje detayları (opsiyonel)
    company_name: "",
    budget_range: "",
    timeline: "",
    project_details: ""
  })

  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate)
    }
  }, [selectedDate])

  const checkAvailability = async (date: Date) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/availability?date=${format(date, 'yyyy-MM-dd')}`)
      if (response.ok) {
        const data = await response.json()
        
        const slots: TimeSlot[] = []
        for (let hour = 9; hour < 18; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            const available = !data.bookedTimes.includes(time)
            slots.push({ time, available })
          }
        }
        setTimeSlots(slots)
      }
    } catch (error) {
      console.error("Müsaitlik kontrolü hatası:", error)
      toast.error("Müsaitlik kontrol edilirken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && !formData.service_type) {
      toast.error("Lütfen bir hizmet seçin")
      return
    }
    if (currentStep === 2 && (!selectedDate || !selectedTime)) {
      toast.error("Lütfen tarih ve saat seçin")
      return
    }
    if (currentStep === 3) {
      if (!formData.customer_name || !formData.customer_email || !formData.customer_phone) {
        toast.error("Lütfen tüm zorunlu alanları doldurun")
        return
      }
    }
    // Step 4 is optional, no validation needed
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  // Timeline değerlerini Türkçeye çevir
  const getTimelineLabel = (value: string) => {
    const timelineMap: Record<string, string> = {
      "urgent": "Acil (1-2 hafta)",
      "1-month": "1 Ay",
      "2-3-months": "2-3 Ay",
      "3-6-months": "3-6 Ay",
      "6+months": "6 Ay+",
      "flexible": "Esnek"
    }
    return timelineMap[value] || value
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Lütfen tarih ve saat seçin")
      return
    }

    setSubmitting(true)

    try {
      const appointmentDate = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':')
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0)

      // Notları birleştir (hem kısa not hem proje detayları)
      const combinedNotes = [
        formData.notes,
        formData.company_name && `Şirket: ${formData.company_name}`,
        formData.budget_range && `Bütçe: ${formData.budget_range}`,
        formData.timeline && `Süre: ${formData.timeline}`,
        formData.project_details && `Proje Detayları: ${formData.project_details}`
      ].filter(Boolean).join('\n\n')

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          service_type: SERVICES.find(s => s.value === formData.service_type)?.label || formData.service_type,
          appointment_date: appointmentDate.toISOString(),
          notes: combinedNotes,
          duration_minutes: 60,
          status: "pending"
        }),
      })

      if (response.ok) {
        setSuccess(true)
        toast.success("Randevu talebiniz oluşturuldu! En kısa sürede sizinle iletişime geçeceğiz.")
      } else {
        toast.error("Randevu oluşturulamadı. Lütfen tekrar deneyin.")
      }
    } catch (error) {
      console.error("Randevu oluşturma hatası:", error)
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setSubmitting(false)
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Randevunuz Oluşturuldu!</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Randevu talebiniz başarıyla alındı. Ekibimiz en kısa sürede sizinle iletişime geçecektir.
            </p>
            <div className="bg-muted/30 rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-4 text-center">Randevu Detayları:</h3>
              <div className="space-y-3 text-sm max-w-lg mx-auto">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Hizmet:</span>
                  <span className="font-semibold">{SERVICES.find(s => s.value === formData.service_type)?.label}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Tarih:</span>
                  <span className="font-semibold">{selectedDate && format(selectedDate, "d MMMM yyyy", { locale: tr })}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Saat:</span>
                  <span className="font-semibold">{selectedTime}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">İsim:</span>
                  <span className="font-semibold">{formData.customer_name}</span>
                </div>
                {formData.company_name && (
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">Şirket:</span>
                    <span className="font-semibold">{formData.company_name}</span>
                  </div>
                )}
                {formData.budget_range && (
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">Bütçe:</span>
                    <span className="font-semibold">{formData.budget_range}</span>
                  </div>
                )}
                {formData.timeline && (
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">Süre:</span>
                    <span className="font-semibold">{getTimelineLabel(formData.timeline)}</span>
                  </div>
                )}
              </div>
            </div>
            <Button size="lg" onClick={() => window.location.href = "/"}>
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ücretsiz Danışmanlık Randevusu
          </h1>
          <p className="text-muted-foreground text-lg">
            Projeniz hakkında konuşalım, size en uygun çözümü bulalım
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              
              return (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all",
                        isCompleted && "bg-green-500 text-white",
                        isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                        !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        "text-sm font-medium",
                        isCurrent && "text-primary",
                        isCompleted && "text-green-600"
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "h-1 flex-1 mx-2 rounded transition-all",
                      currentStep > step.id ? "bg-green-500" : "bg-muted"
                    )} />
                  )}
                </div>
              )
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SERVICES.map((service) => (
                  <button
                    key={service.value}
                    onClick={() => setFormData({ ...formData, service_type: service.value })}
                    className={cn(
                      "p-6 rounded-lg border-2 text-left transition-all hover:scale-105",
                      formData.service_type === service.value
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "text-4xl w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br",
                        service.color
                      )}>
                        {service.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{service.label}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      {formData.service_type === service.value && (
                        <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Date & Time Selection */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-center mb-6">Uygun tarihi seçin</h3>
                  <div className="flex justify-center pt-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={tr}
                      disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md border text-lg scale-110 mb-8"
                      classNames={{
                        months: "space-y-4",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center text-lg font-semibold",
                        caption_label: "text-lg font-semibold",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-12 font-semibold text-base",
                        row: "flex w-full mt-2",
                        cell: "h-12 w-12 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 text-base",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground font-bold",
                        day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <Label className="text-base mb-4 block">
                      Saat Seçin ({format(selectedDate, "d MMMM yyyy", { locale: tr })})
                    </Label>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className="h-12"
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Personal Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">İsim Soyisim *</Label>
                  <Input
                    id="name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="ornek@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="0555 123 45 67"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Projeniz hakkında kısa bilgi..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Project Details (Optional) */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Bu adım opsiyoneldir. Projeniz hakkında daha fazla bilgi verirseniz, görüşmemiz daha verimli olacaktır.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Şirket Adı (Opsiyonel)</Label>
                  <Input
                    id="company"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Şirket veya kuruluş adınız"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Bütçe Aralığı (Opsiyonel)</Label>
                  <select
                    id="budget"
                    value={formData.budget_range}
                    onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Bir bütçe seçin</option>
                    <option value="0-10000">0 - 10.000 TL</option>
                    <option value="10000-25000">10.000 - 25.000 TL</option>
                    <option value="25000-50000">25.000 - 50.000 TL</option>
                    <option value="50000-100000">50.000 - 100.000 TL</option>
                    <option value="100000+">100.000 TL+</option>
                    <option value="flexible">Esnek</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Proje Süresi (Opsiyonel)</Label>
                  <select
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Bir süre seçin</option>
                    <option value="urgent">Acil (1-2 hafta)</option>
                    <option value="1-month">1 Ay</option>
                    <option value="2-3-months">2-3 Ay</option>
                    <option value="3-6-months">3-6 Ay</option>
                    <option value="6+months">6 Ay+</option>
                    <option value="flexible">Esnek</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_details">Proje Detayları (Opsiyonel)</Label>
                  <Textarea
                    id="project_details"
                    value={formData.project_details}
                    onChange={(e) => setFormData({ ...formData, project_details: e.target.value })}
                    placeholder="Projeniz hakkında detaylı bilgi verebilirsiniz..."
                    rows={6}
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  Bu bilgileri paylaşarak randevu görüşmenizi daha verimli hale getirebilirsiniz.
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 text-lg">Randevu Özeti</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">Hizmet</div>
                        <div className="font-medium">{SERVICES.find(s => s.value === formData.service_type)?.label}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">Tarih & Saat</div>
                        <div className="font-medium">
                          {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: tr })} - {selectedTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">İletişim Bilgileri</div>
                        <div className="font-medium">{formData.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{formData.customer_email}</div>
                        <div className="text-sm text-muted-foreground">{formData.customer_phone}</div>
                        {formData.company_name && (
                          <div className="text-sm text-muted-foreground">🏢 {formData.company_name}</div>
                        )}
                      </div>
                    </div>
                    {(formData.budget_range || formData.timeline) && (
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Proje Bilgileri</div>
                          {formData.budget_range && (
                            <div className="text-sm">💰 Bütçe: {formData.budget_range}</div>
                          )}
                          {formData.timeline && (
                            <div className="text-sm">⏰ Süre: {getTimelineLabel(formData.timeline)}</div>
                          )}
                        </div>
                      </div>
                    )}
                    {(formData.notes || formData.project_details) && (
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Notlar</div>
                          {formData.notes && (
                            <div className="font-medium text-sm mb-2">{formData.notes}</div>
                          )}
                          {formData.project_details && (
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.project_details}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ℹ️ Randevunuz onaylandıktan sonra e-posta ve SMS ile bilgilendirileceksiniz.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              size="lg"
              onClick={handleNext}
              className="gap-2"
            >
              İleri
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Randevuyu Oluştur
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
