"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Settings, Eye, LogOut } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface AdminEditBarProps {
  pageId?: string
  pageSlug?: string
}

export function AdminEditBar({ pageId, pageSlug }: AdminEditBarProps) {
  const { isAdmin, logout, loading } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!loading && isAdmin) {
      setIsVisible(true)
    }
  }, [isAdmin, loading])

  const handleLogout = () => {
    logout()
    toast.success("Çıkış yapıldı")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span className="font-medium">Admin Modu</span>
          </div>
          {pageId && (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link href={`/admin/pages/${pageId}/edit`}>
                <Settings className="w-4 h-4 mr-2" />
                Elementor ile Düzenle
              </Link>
            </Button>
          )}
          {pageSlug && (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link href={`/${pageSlug}`} target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                Önizle
              </Link>
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="text-white hover:bg-blue-700"
          >
            <Link href="/admin">
              Admin Panel
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            className="text-white hover:bg-blue-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış
          </Button>
        </div>
      </div>
    </div>
  )
}
