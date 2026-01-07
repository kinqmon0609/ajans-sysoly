import { ContactForm } from "@/components/contact-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "İletişim - Demo Vitrin",
  description: "Demo Vitrin ile iletişime geçin. Telefon, e-posta ve iletişim formu.",
}

export default function ContactPage() {
  return <ContactForm />
}


