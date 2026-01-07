import type { Metadata } from "next"

interface SEOMetadataProps {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  ogType?: string
  canonicalUrl?: string
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  ogImage = "/og-image.png",
  ogType = "website",
  canonicalUrl,
}: SEOMetadataProps): Metadata {
  const siteName = "Demo Showcase"
  const fullTitle = `${title} | ${siteName}`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      title: fullTitle,
      description,
      type: ogType as any,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}
