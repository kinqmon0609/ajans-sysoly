"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Loader2 } from "lucide-react"

interface Testimonial {
  id: string
  client_name: string
  client_company: string | null
  client_position: string | null
  content: string
  rating: number
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials?featured=true")
        const data = await response.json()
        setTestimonials(data.testimonials || [])
      } catch (error) {
        console.error("Referanslar yükleme hatası:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-balance">Müşterilerimiz Ne Diyor?</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Projelerimizi tamamlayan müşterilerimizin görüşleri
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-border">
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-muted-foreground leading-relaxed">{testimonial.content}</p>
                <div>
                  <p className="font-semibold">{testimonial.client_name}</p>
                  {testimonial.client_position && testimonial.client_company && (
                    <p className="text-sm text-muted-foreground">
                      {testimonial.client_position}, {testimonial.client_company}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
