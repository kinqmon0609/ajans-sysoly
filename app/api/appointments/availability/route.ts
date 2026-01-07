import { type NextRequest, NextResponse } from "next/server"

import dbPool from "@/lib/mysql/client"
import { listCalendarEvents } from "@/lib/google-calendar/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Tarih gerekli" }, { status: 400 })
    }

    // 1. Veritabanından dolu olan saatleri getir
    const [bookedSlots]: any = await dbPool.execute(
      `SELECT 
        TIME_FORMAT(appointment_date, '%H:%i') as time
      FROM appointments
      WHERE DATE(appointment_date) = ? 
        AND status != 'cancelled'`,
      [date]
    )

    // Veritabanından gelen dolu saatler
    const dbBookedTimes = bookedSlots.map((slot: any) => slot.time)

    // 2. Google Calendar'dan dolu olan saatleri getir
    let calendarBookedTimes: string[] = []
    try {
      const dateObj = new Date(date)
      const calendarEvents = await listCalendarEvents(dateObj)
      
      // Google Calendar etkinliklerinin başlangıç saatlerini al
      calendarBookedTimes = calendarEvents
        .filter((event: any) => event.start?.dateTime)
        .map((event: any) => {
          const startTime = new Date(event.start.dateTime)
          const hours = startTime.getHours().toString().padStart(2, '0')
          const minutes = startTime.getMinutes().toString().padStart(2, '0')
          return `${hours}:${minutes}`
        })
    } catch (calendarError) {
      console.error("Google Calendar hatası (devam ediliyor):", calendarError)
      // Calendar hatası olursa sadece database kayıtlarını kullan
    }

    // 3. Tüm dolu saatleri birleştir ve tekrarları kaldır
    const allBookedTimes = [...new Set([...dbBookedTimes, ...calendarBookedTimes])]

    return NextResponse.json({ 
      date,
      bookedTimes: allBookedTimes,
      sources: {
        database: dbBookedTimes.length,
        googleCalendar: calendarBookedTimes.length,
        total: allBookedTimes.length
      },
      success: true 
    })
  } catch (error) {
    console.error("Müsaitlik kontrolü hatası:", error)
    return NextResponse.json(
      { error: "Müsaitlik kontrolü başarısız" },
      { status: 500 }
    )
  }
}

