/**
 * Metadata helpers for consistent SEO across the app
 */

export function getBaseUrl() {
  // Priority: ENV var > Vercel URL > localhost
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  return 'http://localhost:3004'
}

export function getAbsoluteUrl(path: string = '') {
  const base = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

export interface PageMetadata {
  title?: string
  description?: string
  image?: string
  path?: string
}

export function generateMetadata({
  title = 'Ajans',
  description = 'Profesyonel web tasarım ve dijital pazarlama hizmetleri',
  image = '/og-image.jpg',
  path = ''
}: PageMetadata = {}) {
  const url = getAbsoluteUrl(path)
  const imageUrl = image.startsWith('http') ? image : getAbsoluteUrl(image)

  return {
    title,
    description,
    metadataBase: new URL(getBaseUrl()),
    openGraph: {
      title,
      description,
      url,
      siteName: 'Ajans',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'tr_TR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}


