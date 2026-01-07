import { notFound } from "next/navigation"
import { PageRenderer } from "@/components/page-renderer"
import type { Metadata } from "next"
<<<<<<< HEAD

// Static export için gerekli
export async function generateStaticParams() {
  return [
    { slug: 'hakkimizda' },
    { slug: 'hizmetlerimiz' },
    { slug: 'iletisim' },
    { slug: 'paketlerimiz' },
    { slug: 'demolarimiz' },
    { slug: 'blog' },
    { slug: 'teklif-formu' },
    { slug: 'randevu' },
    { slug: 'sss' }
  ]
}

async function getPage(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3004"}/api/pages/slug/${slug}`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) return null

    return await response.json()
  } catch (error) {
    console.error("Error fetching page:", error)
    return null
  }
}
=======
import { getPageBySlug } from "@/lib/mysql/queries"
>>>>>>> e25526c

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    return {
      title: "Sayfa Bulunamadı",
    }
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || page.description,
    keywords: page.meta_keywords,
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return <PageRenderer page={page} />
}
