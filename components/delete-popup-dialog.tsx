"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import type { Popup } from "./popup-form-dialog"

type DeletePopupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popup: Popup | null
  onSuccess: () => void
}

export function DeletePopupDialog({ open, onOpenChange, popup, onSuccess }: DeletePopupDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!popup) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/popups/${popup.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete popup")
      }

      toast({
        title: "Popup silindi",
        description: "Popup başarıyla silindi",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting popup:", error)
      toast({
        title: "Hata",
        description: "Popup silinirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Popup'ı silmek istediğinizden emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem geri alınamaz. <strong>{popup?.title}</strong> popup'ı kalıcı olarak silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading ? "Siliniyor..." : "Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}



