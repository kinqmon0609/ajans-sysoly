export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Demo Vitrin</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Modern web çözümleri ile işletmenizi dijitale taşıyoruz.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-foreground transition-colors">
                  Anasayfa
                </a>
              </li>
              <li>
                <a href="/randevu" className="hover:text-foreground transition-colors font-semibold text-green-600 dark:text-green-500">
                  📅 Randevu & Teklif Al
                </a>
              </li>
              <li>
                <a href="/hakkimizda" className="hover:text-foreground transition-colors">
                  Hakkımızda
                </a>
              </li>
              <li>
                <a href="/iletisim" className="hover:text-foreground transition-colors">
                  İletişim
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Kategoriler</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/?category=E-ticaret" className="hover:text-foreground transition-colors">
                  E-ticaret
                </a>
              </li>
              <li>
                <a href="/?category=Kurumsal" className="hover:text-foreground transition-colors">
                  Kurumsal
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">İletişim</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>info@demovitrin.com</li>
              <li>+90 555 123 4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Demo Vitrin. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
