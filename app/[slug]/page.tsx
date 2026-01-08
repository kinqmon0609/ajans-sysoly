import { notFound } from "next/navigation"
import { PageRenderer } from "@/components/page-renderer"
import type { Metadata } from "next"
import { getPageBySlug } from "@/lib/mysql/queries"

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
