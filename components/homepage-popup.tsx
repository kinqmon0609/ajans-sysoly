"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Popup {
  id: string
  title: string
  description: string | null
  image_url: string | null
  button_text: string | null
  button_link: string | null
  is_active: boolean
  show_on_homepage: boolean
  start_date: string | null
  end_date: string | null
  display_order: number
  created_at: string
  updated_at: string
}

const POPUP_STORAGE_KEY = "homepage_popup_shown"

export function HomepagePopup() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const response = await fetch("/api/popups")
        if (!response.ok) throw new Error("Failed to fetch popups")
        
        const data = await response.json()
        const activePopups = data.popups || []
        
        if (activePopups.length > 0) {
          setPopups(activePopups)
          
          // localStorage'dan kontrol et - bugün gösterildi mi?
          const popupData = localStorage.getItem(POPUP_STORAGE_KEY)
          const today = new Date().toDateString()
          
          if (popupData) {
            const { date, popupIds } = JSON.parse(popupData)
            
            // Bugün gösterilmiş ve tüm popuplar gösterilmişse açma
            if (date === today && popupIds.length >= activePopups.length) {
              setLoading(false)
              return
            }
          }
          
          // Popup'ı aç (kısa bir gecikme ile)
          setTimeout(() => {
            setIsOpen(true)
            setLoading(false)
          }, 1000)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching popups:", error)
        setLoading(false)
      }
    }

    fetchPopups()
  }, [])

  const handleClose = () => {
    // localStorage'a kaydet
    const today = new Date().toDateString()
    const currentPopupId = popups[currentPopupIndex]?.id
    
    if (currentPopupId) {
      const popupData = localStorage.getItem(POPUP_STORAGE_KEY)
      let shownPopups: string[] = []
      
      if (popupData) {
        const { date, popupIds } = JSON.parse(popupData)
        if (date === today) {
          shownPopups = popupIds
        }
      }
      
      if (!shownPopups.includes(currentPopupId)) {
        shownPopups.push(currentPopupId)
      }
      
      localStorage.setItem(
        POPUP_STORAGE_KEY,
        JSON.stringify({ date: today, popupIds: shownPopups })
      )
    }
    
    // Bir sonraki popup varsa göster
    if (currentPopupIndex < popups.length - 1) {
      setCurrentPopupIndex(currentPopupIndex + 1)
    } else {
      setIsOpen(false)
    }
  }

  if (loading || popups.length === 0) {
    return null
  }

  const currentPopup = popups[currentPopupIndex]
  if (!currentPopup) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {currentPopup.image_url && (
          <div className="relative w-full aspect-video">
            <Image
              src={currentPopup.image_url}
              alt={currentPopup.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{currentPopup.title}</DialogTitle>
            {currentPopup.description && (
              <DialogDescription className="text-base">
                {currentPopup.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex gap-3">
            {currentPopup.button_text && currentPopup.button_link && (
              <Button asChild className="flex-1">
                <Link href={currentPopup.button_link} onClick={handleClose}>
                  {currentPopup.button_text}
                </Link>
              </Button>
            )}
            <Button variant="outline" onClick={handleClose} className="flex-1">
              {currentPopupIndex < popups.length - 1 ? "Sonraki" : "Kapat"}
            </Button>
          </div>

          {popups.length > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              {popups.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentPopupIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}



