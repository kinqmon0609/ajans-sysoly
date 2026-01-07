import Link from "next/link"
import { Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbItemType {
  label: string
  href?: string
}

interface PageBreadcrumbProps {
  title: string
  description?: string
  items?: BreadcrumbItemType[]
}

export function PageBreadcrumb({ title, description, items = [] }: PageBreadcrumbProps) {
  return (
    <div className="border-b bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Breadcrumb - Centered */}
          <div className="mb-6 flex justify-center">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="flex items-center gap-1 hover:text-primary">
                      <Home className="h-4 w-4" />
                      Ana Sayfa
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {items.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={item.href} className="hover:text-primary">
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* Page Title - Centered */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="text-base text-muted-foreground md:text-lg">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

