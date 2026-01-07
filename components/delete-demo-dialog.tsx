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
import { useDemos, type Demo } from "@/lib/demo-context"
import { useToast } from "@/hooks/use-toast"

type DeleteDemoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  demo: Demo | null
}

export function DeleteDemoDialog({ open, onOpenChange, demo }: DeleteDemoDialogProps) {
  const { deleteDemo } = useDemos()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!demo) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    deleteDemo(demo.id)
    toast({
      title: "Demo silindi",
      description: "Demo başarıyla silindi",
    })

    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Demoyu silmek istediğinize emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem geri alınamaz. <strong>{demo?.title}</strong> demosu kalıcı olarak silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Siliniyor..." : "Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
