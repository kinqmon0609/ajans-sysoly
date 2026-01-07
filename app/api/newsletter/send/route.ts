import { type NextRequest, NextResponse } from "next/server"

import { getNewsletterSubscribers } from "@/lib/mysql/queries"
import { sendEmail } from "@/lib/email/mailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, content } = body

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Konu ve içerik gereklidir" },
        { status: 400 }
      )
    }

    // Aktif ve doğrulanmış aboneleri getir
    const subscribers = await getNewsletterSubscribers()
    const activeSubscribers = subscribers.filter((s: any) => s.is_active && s.is_verified)

    if (activeSubscribers.length === 0) {
      return NextResponse.json(
        { error: "Aktif abone bulunamadı" },
        { status: 400 }
      )
    }

    // Her aboneye e-posta gönder
    const sendPromises = activeSubscribers.map((subscriber: any) => {
      return sendEmail({
        to: subscriber.email,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                ${content}
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 12px;">
                <p>Bu e-postayı almak istemiyorsanız <a href="#" style="color: #888;">abonelikten çıkabilirsiniz</a>.</p>
                <p>&copy; ${new Date().getFullYear()} Tüm hakları saklıdır.</p>
              </div>
            </body>
          </html>
        `
      }).catch((error) => {
        console.error(`Failed to send to ${subscriber.email}:`, error)
        return { error, email: subscriber.email }
      })
    })

    const results = await Promise.allSettled(sendPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: activeSubscribers.length,
      message: `${successful} e-posta gönderildi${failed > 0 ? `, ${failed} başarısız` : ''}`
    })
  } catch (error) {
    console.error("Newsletter send error:", error)
    return NextResponse.json(
      { error: "Kampanya gönderilirken hata oluştu" },
      { status: 500 }
    )
  }
}

