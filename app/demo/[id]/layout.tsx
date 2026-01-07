import type { ReactNode } from "react"

// Layout'ı basitleştirdik - metadata client-side'da yönetiliyor
export default function DemoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
