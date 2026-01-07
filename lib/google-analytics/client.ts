import { BetaAnalyticsDataClient } from "@google-analytics/data"

let analyticsDataClient: BetaAnalyticsDataClient | null = null

export function getAnalyticsClient() {
  if (!analyticsDataClient) {
    try {
      const credentials = process.env.GA_CREDENTIALS
      
      if (!credentials) {
        // GA is optional - silent fail
        return null
      }

      const credentialsJson = JSON.parse(credentials)
      
      analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: credentialsJson,
      })
    } catch (error) {
      // GA is optional - silent fail
      return null
    }
  }

  return analyticsDataClient
}

export function getPropertyId() {
  return process.env.GA_PROPERTY_ID || null
}

