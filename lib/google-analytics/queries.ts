import { getAnalyticsClient, getPropertyId } from "./client"

export interface AnalyticsDateRange {
  startDate: string // Format: YYYY-MM-DD
  endDate: string // Format: YYYY-MM-DD
}

export interface AnalyticsMetric {
  name: string
  value: string
}

export interface DimensionValue {
  [key: string]: string
  value: string
}

// Realtime aktif kullanıcıları getir
export async function getRealtimeUsers() {
  const client = getAnalyticsClient()
  const propertyId = getPropertyId()

  if (!client || !propertyId) {
    return { activeUsers: 0 }
  }

  try {
    const [response] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: "activeUsers" }],
    })

    const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || "0"

    return {
      activeUsers: parseInt(activeUsers),
    }
  } catch (error) {
    console.error("Realtime users hatası:", error)
    return { activeUsers: 0 }
  }
}

// Ülke bazlı ziyaretçi verileri
export async function getUsersByCountry(dateRange: AnalyticsDateRange) {
  const client = getAnalyticsClient()
  const propertyId = getPropertyId()

  if (!client || !propertyId) {
    return []
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "country" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    })

    return (
      response.rows?.map((row) => ({
        country: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        sessions: parseInt(row.metricValues?.[1]?.value || "0"),
        pageViews: parseInt(row.metricValues?.[2]?.value || "0"),
      })) || []
    )
  } catch (error) {
    console.error("Country data hatası:", error)
    return []
  }
}

// Şehir bazlı ziyaretçi verileri
export async function getUsersByCity(dateRange: AnalyticsDateRange) {
  const client = getAnalyticsClient()
  const propertyId = getPropertyId()

  if (!client || !propertyId) {
    return []
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "city" }, { name: "country" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 20,
    })

    return (
      response.rows?.map((row) => ({
        city: row.dimensionValues?.[0]?.value || "Unknown",
        country: row.dimensionValues?.[1]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      })) || []
    )
  } catch (error) {
    console.error("City data hatası:", error)
    return []
  }
}

// Sayfa bazlı görüntüleme verileri
export async function getPageViews(dateRange: AnalyticsDateRange) {
  const client = getAnalyticsClient()
  const propertyId = getPropertyId()

  if (!client || !propertyId) {
    return []
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 20,
    })

    return (
      response.rows?.map((row) => ({
        title: row.dimensionValues?.[0]?.value || "Unknown",
        path: row.dimensionValues?.[1]?.value || "/",
        views: parseInt(row.metricValues?.[0]?.value || "0"),
        avgDuration: parseFloat(row.metricValues?.[1]?.value || "0"),
        bounceRate: parseFloat(row.metricValues?.[2]?.value || "0"),
      })) || []
    )
  } catch (error) {
    console.error("Page views hatası:", error)
    return []
  }
}

// Genel metrikler (kullanıcılar, oturumlar, sayfa görüntüleme, vb.)
export async function getOverviewMetrics(dateRange: AnalyticsDateRange) {
  const client = getAnalyticsClient()
  const propertyId = getPropertyId()

  if (!client || !propertyId) {
    return null
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "newUsers" },
      ],
    })

    const row = response.rows?.[0]

    return {
      users: parseInt(row?.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row?.metricValues?.[1]?.value || "0"),
      pageViews: parseInt(row?.metricValues?.[2]?.value || "0"),
      avgSessionDuration: parseFloat(row?.metricValues?.[3]?.value || "0"),
      bounceRate: parseFloat(row?.metricValues?.[4]?.value || "0"),
      newUsers: parseInt(row?.metricValues?.[5]?.value || "0"),
    }
  } catch (error) {
    console.error("Overview metrics hatası:", error)
    return null
  }
}

// Zaman bazlı trend verileri (günlük, haftalık, aylık)
export async function getTimeTrendData(dateRange: AnalyticsDateRange) {
  const client = getAnalyticsClient()
  const propertyId = getPropertyId()

  if (!client || !propertyId) {
    return []
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    })

    return (
      response.rows?.map((row) => ({
        date: row.dimensionValues?.[0]?.value || "",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        sessions: parseInt(row.metricValues?.[1]?.value || "0"),
        pageViews: parseInt(row.metricValues?.[2]?.value || "0"),
      })) || []
    )
  } catch (error) {
    console.error("Time trend data hatası:", error)
    return []
  }
}

// Cihaz kategorisi bazlı veriler
export async function getUsersByDevice(dateRange: AnalyticsDateRange) {
  const client = getAnalyticsClient()
  const propertyId = getPropertyId()

  if (!client || !propertyId) {
    return []
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    })

    return (
      response.rows?.map((row) => ({
        device: row.dimensionValues?.[0]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      })) || []
    )
  } catch (error) {
    console.error("Device data hatası:", error)
    return []
  }
}

// Trafik kaynağı bazlı veriler
export async function getUsersBySource(dateRange: AnalyticsDateRange) {
  const client = getAnalyticsClient()
  const propertyId = getPropertyId()

  if (!client || !propertyId) {
    return []
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    })

    return (
      response.rows?.map((row) => ({
        source: row.dimensionValues?.[0]?.value || "Unknown",
        medium: row.dimensionValues?.[1]?.value || "Unknown",
        sessions: parseInt(row.metricValues?.[0]?.value || "0"),
        users: parseInt(row.metricValues?.[1]?.value || "0"),
      })) || []
    )
  } catch (error) {
    console.error("Source data hatası:", error)
    return []
  }
}

