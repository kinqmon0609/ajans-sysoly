import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Demo } from "@/lib/demo-context"

type DemoCardProps = {
  demo: Demo
}

export function DemoCard({ demo }: DemoCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/2] overflow-hidden bg-muted">
          <Image
            src={demo.thumbnail && typeof demo.thumbnail === 'string' && demo.thumbnail.trim() !== "" ? demo.thumbnail : "/placeholder.svg"}
            alt={demo.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="absolute right-3 top-3" variant={demo.category === "E-ticaret" ? "default" : "secondary"}>
            {demo.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="mb-2 text-xl font-semibold text-balance">{demo.title}</h3>
        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{demo.shortDescription}</p>
        <p className="text-2xl font-bold">{demo.price.toLocaleString("tr-TR")} ₺</p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full bg-transparent" variant="outline">
          <Link href={`/demo/${demo.id}`}>Detayları Gör</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
