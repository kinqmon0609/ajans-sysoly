"use client"

import Link from "next/link"
import { useState, useEffect, useMemo } from "react"

interface MenuItem {
  id: string
  menu_id: string
  page_id: string | null
  label: string
  url: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  page_title?: string
  page_slug?: string
}

// Menü cache'i - Production'da daha uzun
const MENU_CACHE_KEY = "menu_cache"
const MENU_CACHE_DURATION = process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 5 * 60 * 1000 // Production'da 15 dakika

export function Header() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    async function loadMenu() {
      try {
        // Cache'i temizle - her zaman fresh data yükle
        if (typeof window !== 'undefined') {
          localStorage.removeItem(MENU_CACHE_KEY)
        }

        // Cache yoksa veya eskiyse API'den yükle
        const menusRes = await fetch("/api/menus")
        if (!menusRes.ok) {
          throw new Error(`Failed to fetch menus: ${menusRes.status}`)
        }

        const menusData = await menusRes.json()
        const menus = Array.isArray(menusData) ? menusData : []
        const mainMenu = menus.find((m: any) => m.slug === "main-menu" && m.is_active)

        if (mainMenu) {
          const itemsRes = await fetch(`/api/menus/items?menuId=${mainMenu.id}`)
          if (!itemsRes.ok) {
            throw new Error(`Failed to fetch menu items: ${itemsRes.status}`)
          }

          const itemsData = await itemsRes.json()
          const items = Array.isArray(itemsData) ? itemsData : []
          const activeItems = items.filter((item: MenuItem) => item.is_active)

          setMenuItems(activeItems)

          // Cache'e kaydet (sadece gerekli field'ları - boyut optimizasyonu)
          if (typeof window !== 'undefined') {
            try {
              // Minimal field'lar ile cache boyutunu azalt
              const minimalItems = activeItems.map((item: MenuItem) => ({
                id: item.id,
                menu_id: item.menu_id,
                page_id: item.page_id,
                label: item.label,
                url: item.url,
                parent_id: item.parent_id,
                display_order: item.display_order,
                is_active: item.is_active,
                page_title: item.page_title,
                page_slug: item.page_slug
              }))

              const cacheData = JSON.stringify({
                data: minimalItems,
                timestamp: Date.now()
              })

              // Max 50KB cache limiti
              if (new Blob([cacheData]).size < 50 * 1024) {
                localStorage.setItem(MENU_CACHE_KEY, cacheData)
              } else {
                console.warn("⚠️ Menu cache çok büyük (>50KB), cache atlanıyor")
                localStorage.removeItem(MENU_CACHE_KEY)
              }
            } catch (e) {
              console.error("Cache kaydetme hatası:", e)
              // QuotaExceededError ise temizle
              if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                localStorage.removeItem(MENU_CACHE_KEY)
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load menu:", error)
        setMenuItems([])
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [])

  // Parent-child ilişkisine göre gruplama - useMemo ile optimize et
  const menuStructure = useMemo(() => {
    // Sadece parent öğeleri al (parent_id null olanlar)
    const parentItems = menuItems.filter(item => !item.parent_id).sort((a, b) => a.display_order - b.display_order)
    
    return parentItems.map(parent => {
      // Bu parent'a ait child öğeleri bul
      const children = menuItems.filter(item => item.parent_id === parent.id).sort((a, b) => a.display_order - b.display_order)
      return { parent, children }
    })
  }, [menuItems])

  const getHref = (item: MenuItem) => {
    if (item.page_id && item.page_slug) {
      return `/${item.page_slug}`
    }
    return item.url || "#"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 z-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-xl font-bold text-white">D</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Demo Vitrin</span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile/tablet */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
          {/* Anasayfa - Sabit Link */}
          <Link href="/" prefetch={false} className="text-sm xl:text-base text-gray-700 hover:text-blue-600 font-semibold transition-colors whitespace-nowrap">
            Anasayfa
          </Link>

          {/* Dinamik Menü Öğeleri */}
          {!loading && menuItems.length > 0 && menuStructure.map(({ parent, children }) => {
            const href = getHref(parent)

            // Alt menüsü varsa dropdown göster
            if (children.length > 0) {
              return (
                <div key={parent.id} className="relative group">
                  <button className="text-sm xl:text-base text-gray-700 hover:text-blue-600 font-semibold transition-colors flex items-center gap-1 whitespace-nowrap">
                    {parent.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {children.map((child) => {
                      const childHref = getHref(child)
                      const childPageTitle = child.page_title || child.label
                      return (
                        <Link
                          key={child.id}
                          href={childHref}
                          prefetch={false}
                          className="block px-4 py-3 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors first:rounded-t-lg last:rounded-b-lg font-semibold"
                        >
                          {childPageTitle}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }

            // Alt menüsü yoksa normal link
            return (
              <Link
                key={parent.id}
                href={href}
                prefetch={false}
                className="text-sm xl:text-base text-gray-700 hover:text-blue-600 font-semibold transition-colors whitespace-nowrap"
              >
                {parent.label}
              </Link>
            )
          })}

          {/* Randevu & Teklif Al Butonu */}
          <Link
            href="/randevu"
            prefetch={true}
            className="px-4 xl:px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap text-sm xl:text-base"
            title="Randevu alın veya teklif talep edin"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Randevu & Teklif
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden z-50 p-2 text-gray-700 hover:text-blue-600 transition-colors"
          aria-label="Menüyü aç/kapat"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-white z-40 overflow-y-auto">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {/* Anasayfa */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg text-gray-700 hover:text-blue-600 font-semibold transition-colors py-2 border-b border-gray-100"
            >
              Anasayfa
            </Link>

            {/* Dinamik Menü Öğeleri */}
            {!loading && menuItems.length > 0 && menuStructure.map(({ parent, children }) => {
              const href = getHref(parent)

              // Alt menüsü varsa accordion göster
              if (children.length > 0) {
                const isOpen = openDropdown === parent.id
                return (
                  <div key={parent.id} className="border-b border-gray-100">
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : parent.id)}
                      className="w-full text-lg text-gray-700 hover:text-blue-600 font-semibold transition-colors py-2 flex items-center justify-between"
                    >
                      {parent.label}
                      <svg
                        className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="pl-4 pb-2 flex flex-col gap-2">
                        {children.map((child) => {
                          const childHref = getHref(child)
                          const childPageTitle = child.page_title || child.label
                          return (
                            <Link
                              key={child.id}
                              href={childHref}
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-base text-gray-600 hover:text-blue-600 transition-colors py-2"
                            >
                              {childPageTitle}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              // Alt menüsü yoksa normal link
              return (
                <Link
                  key={parent.id}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg text-gray-700 hover:text-blue-600 font-semibold transition-colors py-2 border-b border-gray-100"
                >
                  {parent.label}
                </Link>
              )
            })}

            {/* Randevu & Teklif Al Butonu */}
            <Link
              href="/randevu"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Randevu & Teklif Al
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
