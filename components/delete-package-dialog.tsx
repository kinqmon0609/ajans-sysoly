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
import type { Package } from "./package-form-dialog"

type DeletePackageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  package: Package | null
  onSuccess: () => void
}

export function DeletePackageDialog({ open, onOpenChange, package: pkg, onSuccess }: DeletePackageDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!pkg) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/packages/${pkg.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete package")
      }

      toast({
        title: "Paket silindi",
        description: "Paket başarıyla silindi",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting package:", error)
      toast({
        title: "Hata",
        description: "Paket silinirken bir hata oluştu",
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
          <AlertDialogTitle>Paketi silmek istediğinizden emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem geri alınamaz. <strong>{pkg?.name}</strong> paketi kalıcı olarak silinecektir.
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

