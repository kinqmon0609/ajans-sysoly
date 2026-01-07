import { google } from 'googleapis'

/**
 * Google Calendar API istemcisi oluşturur
 */
export function getCalendarClient() {
  if (!process.env.GOOGLE_CALENDAR_CLIENT_ID || 
      !process.env.GOOGLE_CALENDAR_CLIENT_SECRET || 
      !process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) {
    throw new Error('Google Calendar credentials not configured')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:3002/api/auth/google/callback'
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
  })

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

/**
 * Google Calendar'a etkinlik ekler
 */
export async function createCalendarEvent(eventData: {
  summary: string
  description?: string
  start: string // ISO 8601 format
  end: string // ISO 8601 format
  attendees?: string[] // Email addresses
  location?: string
}) {
  try {
    const calendar = getCalendarClient()
    
    const event = {
      summary: eventData.summary,
      description: eventData.description,
      location: eventData.location,
      start: {
        dateTime: eventData.start,
        timeZone: 'Europe/Istanbul',
      },
      end: {
        dateTime: eventData.end,
        timeZone: 'Europe/Istanbul',
      },
      attendees: eventData.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: event,
      sendUpdates: 'all', // Send email to attendees
    })

    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink
    }
  } catch (error: any) {
    console.error('Google Calendar create event error:', error)
    throw new Error(`Calendar event creation failed: ${error.message}`)
  }
}

/**
 * Google Calendar'dan etkinlik günceller
 */
export async function updateCalendarEvent(eventId: string, eventData: {
  summary?: string
  description?: string
  start?: string
  end?: string
  attendees?: string[]
  location?: string
}) {
  try {
    const calendar = getCalendarClient()
    
    const event: any = {}
    
    if (eventData.summary) event.summary = eventData.summary
    if (eventData.description) event.description = eventData.description
    if (eventData.location) event.location = eventData.location
    
    if (eventData.start) {
      event.start = {
        dateTime: eventData.start,
        timeZone: 'Europe/Istanbul',
      }
    }
    
    if (eventData.end) {
      event.end = {
        dateTime: eventData.end,
        timeZone: 'Europe/Istanbul',
      }
    }
    
    if (eventData.attendees) {
      event.attendees = eventData.attendees.map(email => ({ email }))
    }

    const response = await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId,
      requestBody: event,
      sendUpdates: 'all',
    })

    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink
    }
  } catch (error: any) {
    console.error('Google Calendar update event error:', error)
    throw new Error(`Calendar event update failed: ${error.message}`)
  }
}

/**
 * Google Calendar'dan etkinlik siler
 */
export async function deleteCalendarEvent(eventId: string) {
  try {
    const calendar = getCalendarClient()
    
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId,
      sendUpdates: 'all',
    })

    return { success: true }
  } catch (error: any) {
    console.error('Google Calendar delete event error:', error)
    throw new Error(`Calendar event deletion failed: ${error.message}`)
  }
}

/**
 * Google Calendar'dan etkinlik getirir
 */
export async function getCalendarEvent(eventId: string) {
  try {
    const calendar = getCalendarClient()
    
    const response = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId,
    })

    return response.data
  } catch (error: any) {
    console.error('Google Calendar get event error:', error)
    throw new Error(`Calendar event retrieval failed: ${error.message}`)
  }
}

/**
 * Belirli bir tarih için Google Calendar etkinliklerini listeler
 */
export async function listCalendarEvents(date: Date) {
  try {
    const calendar = getCalendarClient()
    
    // Günün başlangıcı
    const timeMin = new Date(date)
    timeMin.setHours(0, 0, 0, 0)
    
    // Günün sonu
    const timeMax = new Date(date)
    timeMax.setHours(23, 59, 59, 999)
    
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })
    
    return response.data.items || []
  } catch (error: any) {
    console.error('Google Calendar list events error:', error)
    // Hata durumunda boş array döndür (Calendar yapılandırılmamış olabilir)
    return []
  }
}

