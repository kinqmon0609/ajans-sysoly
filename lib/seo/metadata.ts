export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function generateMetaTags(metadata: SEOMetadata) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords?.join(', '),
    robots: {
      index: !metadata.noindex,
      follow: !metadata.nofollow,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: metadata.ogType || 'website',
      url: metadata.ogUrl || baseUrl,
      images: metadata.ogImage ? [{ url: metadata.ogImage }] : [],
      siteName: 'Ajans Panel',
    },
    twitter: {
      card: metadata.twitterCard || 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: metadata.ogImage ? [metadata.ogImage] : [],
    },
    alternates: {
      canonical: metadata.canonical,
    },
  };
}

export function generateStructuredData(type: 'Organization' | 'Article' | 'Product', data: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  
  if (type === 'Organization') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Ajans Panel',
      url: baseUrl,
      logo: `${baseUrl}/placeholder-logo.png`,
      description: 'Profesyonel web tasarım ve dijital pazarlama hizmetleri',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'TR',
      },
      sameAs: [
        'https://facebook.com/ajanspanel',
        'https://twitter.com/ajanspanel',
        'https://linkedin.com/company/ajanspanel',
      ],
    };
  }
  
  if (type === 'Article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title,
      description: data.description,
      image: data.image,
      datePublished: data.published_at,
      dateModified: data.updated_at,
      author: {
        '@type': 'Person',
        name: data.author || 'Admin',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Ajans Panel',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/placeholder-logo.png`,
        },
      },
    };
  }
  
  if (type === 'Product') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name,
      description: data.description,
      image: data.image,
      offers: {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: 'TRY',
        availability: 'https://schema.org/InStock',
      },
    };
  }
  
  return null;
}

export function generateBreadcrumb(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

