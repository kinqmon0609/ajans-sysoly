"use client"

import { useState } from "react"
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
import { usePages, type Page } from "@/lib/pages-context"
import { Loader2 } from "lucide-react"

interface DeletePageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: Page | null
}

export function DeletePageDialog({ open, onOpenChange, page }: DeletePageDialogProps) {
  const { deletePage } = usePages()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!page) return

    setLoading(true)
    try {
      await deletePage(page.id)
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting page:", error)
      alert("Sayfa silinirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sayfayı Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{page?.title}</strong> sayfasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
