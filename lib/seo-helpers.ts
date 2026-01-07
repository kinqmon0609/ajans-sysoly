/**
 * SEO Helpers - Slug generation and metadata utilities
 */

const turkishCharMap: Record<string, string> = {
  'ç': 'c', 'Ç': 'C',
  'ğ': 'g', 'Ğ': 'G',
  'ı': 'i', 'İ': 'I',
  'ö': 'o', 'Ö': 'O',
  'ş': 's', 'Ş': 'S',
  'ü': 'u', 'Ü': 'U',
}

/**
 * Convert Turkish characters to English equivalents
 */
export function transliterate(text: string): string {
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => turkishCharMap[char] || char)
}

/**
 * Generate SEO-friendly URL slug
 * @param text - Input text (can contain Turkish characters)
 * @returns URL-safe slug
 * 
 * @example
 * slugify("Web Tasarım Hizmetleri & Çözümleri") 
 * // => "web-tasarim-hizmetleri-cozumleri"
 */
export function slugify(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .trim()
    // Replace spaces and special chars with dash
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
    // Replace multiple dashes with single dash
    .replace(/-{2,}/g, '-')
}

/**
 * Generate metadata for a page
 */
export interface MetadataOptions {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
}

export function generateSEOMetadata(options: MetadataOptions) {
  const {
    title,
    description,
    keywords = [],
    image = '/og-image.jpg',
    url = '',
    type = 'website',
    publishedTime,
    modifiedTime,
    author = 'Ajans'
  } = options

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  return {
    title,
    description,
    keywords: keywords.join(', '),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Ajans',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'tr_TR',
      type,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: [author],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@ajans',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number = 160): string {
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}



