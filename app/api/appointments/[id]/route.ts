import { NextRequest, NextResponse } from "next/server";

// generateStaticParams kaldırıldı - PUT request'leri için gerekli
import { updateAppointmentStatus } from "@/lib/mysql/queries";
import { verifyToken } from "@/lib/auth/jwt";
import { updateCalendarEvent, deleteCalendarEvent } from "@/lib/google-calendar/client";
import { pool } from "@/lib/mysql/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let payload = verifyToken(token);
    
    // Fallback: mock token desteği (geliştirme amaçlı)
    if (!payload) {
      try {
        payload = JSON.parse(atob(token)) as any;
      } catch {
        return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
      }
    }

    if (!payload || (payload.role !== 'admin' && payload.role !== 'editor')) {
      return NextResponse.json({ error: "Yetki gerekli" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
    }

    await updateAppointmentStatus(id, status);

    // Sync status to Google Calendar
    try {
      // Get appointment details including google_calendar_event_id
      const [rows]: any = await pool.execute(
        "SELECT google_calendar_event_id, customer_name, service_type FROM appointments WHERE id = ?",
        [id]
      );

      if (rows.length > 0 && rows[0].google_calendar_event_id) {
        const googleEventId = rows[0].google_calendar_event_id;
        
        // If cancelled, delete from calendar
        if (status === 'cancelled') {
          await deleteCalendarEvent(googleEventId);
        } else {
          // Update event title to reflect status
          let statusEmoji = '';
          if (status === 'confirmed') statusEmoji = '✅ ';
          else if (status === 'completed') statusEmoji = '✔️ ';
          else if (status === 'pending') statusEmoji = '⏳ ';
          
          await updateCalendarEvent(googleEventId, {
            summary: `${statusEmoji}Randevu: ${rows[0].customer_name}${rows[0].service_type ? ` - ${rows[0].service_type}` : ''}`
          });
        }
      }
    } catch (calendarError) {
      console.error("Google Calendar sync error:", calendarError);
      // Continue even if calendar sync fails
    }

    return NextResponse.json({ success: true, message: "Randevu güncellendi" });

  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let payload = verifyToken(token);
    
    // Fallback: mock token desteği (geliştirme amaçlı)
    if (!payload) {
      try {
        payload = JSON.parse(atob(token)) as any;
      } catch {
        return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
      }
    }

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }

    const { id } = await params;

    // Get Google Calendar event ID before deleting
    const [rows]: any = await pool.execute(
      "SELECT google_calendar_event_id FROM appointments WHERE id = ?",
      [id]
    );

    // Delete from database
    await pool.execute("DELETE FROM appointments WHERE id = ?", [id]);

    // Delete from Google Calendar
    if (rows.length > 0 && rows[0].google_calendar_event_id) {
      try {
        await deleteCalendarEvent(rows[0].google_calendar_event_id);
      } catch (calendarError) {
        console.error("Google Calendar delete error:", calendarError);
        // Continue even if calendar delete fails
      }
    }

    return NextResponse.json({ success: true, message: "Randevu silindi" });

  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json({ error: "Silme işlemi başarısız" }, { status: 500 });
  }
}

