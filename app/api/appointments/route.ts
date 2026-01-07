import { NextRequest, NextResponse } from "next/server";

import { createAppointment, getAppointments } from "@/lib/mysql/queries";
import { sendEmail } from "@/lib/email/mailer";
import { sendWhatsApp } from "@/lib/sms/twilio";
import { createCalendarEvent } from "@/lib/google-calendar/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

    const appointments = await getAppointments({ status, dateFrom, dateTo });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "Randevular yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_email, customer_phone, service_type, appointment_date, duration_minutes, notes } = body;

    // Validation
    if (!customer_name || !customer_email || !appointment_date) {
      return NextResponse.json(
        { error: "Ad, e-posta ve tarih gereklidir" },
        { status: 400 }
      );
    }

    // Create appointment in database
    const appointmentResult: any = await createAppointment({
      customer_name,
      customer_email,
      customer_phone,
      service_type,
      appointment_date: new Date(appointment_date),
      duration_minutes: duration_minutes || 60,
      notes
    });

    // Sync to Google Calendar
    let googleCalendarEventId = null;
    try {
      const startDate = new Date(appointment_date);
      const endDate = new Date(startDate.getTime() + (duration_minutes || 60) * 60000);
      
      const calendarEvent = await createCalendarEvent({
        summary: `Randevu: ${customer_name}${service_type ? ` - ${service_type}` : ''}`,
        description: `
          Müşteri: ${customer_name}
          E-posta: ${customer_email}
          Telefon: ${customer_phone || 'Belirtilmedi'}
          ${notes ? `\nNotlar: ${notes}` : ''}
        `.trim(),
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        attendees: [customer_email],
      });
      
      googleCalendarEventId = calendarEvent.eventId;
      
      // Update appointment with Google Calendar event ID
      if (appointmentResult.insertId && googleCalendarEventId) {
        const { pool } = await import("@/lib/mysql/client");
        await pool.execute(
          "UPDATE appointments SET google_calendar_event_id = ? WHERE id = ?",
          [googleCalendarEventId, appointmentResult.insertId]
        );
      }
    } catch (calendarError) {
      console.error("Google Calendar sync error:", calendarError);
      // Continue even if calendar sync fails
    }

    // Send confirmation email
    await sendEmail({
      to: customer_email,
      subject: 'Randevu Talebiniz Alındı',
      html: `
        <h1>Merhaba ${customer_name},</h1>
        <p>Randevu talebiniz başarıyla alındı.</p>
        <p><strong>Tarih:</strong> ${new Date(appointment_date).toLocaleString('tr-TR')}</p>
        <p><strong>Hizmet:</strong> ${service_type || 'Belirtilmedi'}</p>
        <p>En kısa sürede tarafınıza dönüş yapacağız.</p>
      `
    });

    // Send WhatsApp message if phone provided
    if (customer_phone) {
      await sendWhatsApp({
        to: customer_phone,
        message: `Merhaba ${customer_name}, randevu talebiniz alındı. Tarih: ${new Date(appointment_date).toLocaleString('tr-TR')}`
      });
    }

    return NextResponse.json({
      success: true,
      message: "Randevu talebiniz oluşturuldu"
    });

  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: "Randevu oluşturulamadı" },
      { status: 500 }
    );
  }
}

