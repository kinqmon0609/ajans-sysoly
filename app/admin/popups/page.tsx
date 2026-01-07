"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Loader2, Image as ImageIcon } from "lucide-react"
import { PopupFormDialog, type Popup } from "@/components/popup-form-dialog"
import { DeletePopupDialog } from "@/components/delete-popup-dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function AdminPopupsPage() {
  const { toast } = useToast()
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null)

  const fetchPopups = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/popups?includeInactive=true")
      if (!response.ok) throw new Error("Failed to fetch popups")
      const data = await response.json()
      setPopups(data.popups || [])
    } catch (error) {
      console.error("Error fetching popups:", error)
      toast({
        title: "Hata",
        description: "Popup'lar yüklenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPopups()
  }, [])

  const filteredPopups = popups.filter((popup) =>
    popup.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (popup: Popup) => {
    setSelectedPopup(popup)
    setIsFormOpen(true)
  }

  const handleDelete = (popup: Popup) => {
    setSelectedPopup(popup)
    setIsDeleteOpen(true)
  }

  const handleAdd = () => {
    setSelectedPopup(null)
    setIsFormOpen(true)
  }

  const toggleStatus = async (id: string) => {
    try {
      const popup = popups.find((p) => p.id === id)
      if (!popup) return

      const response = await fetch(`/api/popups/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...popup,
          is_active: !popup.is_active,
        }),
      })

      if (!response.ok) throw new Error("Failed to update popup status")

      toast({
        title: "Durum güncellendi",
        description: `Popup ${!popup.is_active ? "aktif" : "pasif"} edildi`,
      })

      fetchPopups()
    } catch (error) {
      console.error("Error toggling popup status:", error)
      toast({
        title: "Hata",
        description: "Durum güncellenirken hata oluştu",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Popup Yönetimi</h1>
          <p className="text-muted-foreground">Anasayfa popup'larını görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Popup
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Popup ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resim</TableHead>
              <TableHead>Başlık</TableHead>
              <TableHead>Buton</TableHead>
              <TableHead>Sıralama</TableHead>
              <TableHead>Anasayfa</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredPopups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Popup bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredPopups.map((popup) => (
                <TableRow key={popup.id}>
                  <TableCell>
                    {popup.image_url ? (
                      <div className="relative h-12 w-16 overflow-hidden rounded">
                        <Image
                          src={popup.image_url}
                          alt={popup.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded bg-muted">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{popup.title}</TableCell>
                  <TableCell>
                    {popup.button_text || "-"}
                  </TableCell>
                  <TableCell>{popup.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={popup.show_on_homepage ? "default" : "secondary"}>
                      {popup.show_on_homepage ? "Evet" : "Hayır"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={popup.is_active ? "default" : "secondary"}>
                      {popup.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatus(popup.id)}
                        title={popup.is_active ? "Pasif yap" : "Aktif yap"}
                      >
                        {popup.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(popup)} title="Düzenle">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(popup)}
                        title="Sil"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PopupFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        popup={selectedPopup}
        onSuccess={fetchPopups}
      />
      <DeletePopupDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        popup={selectedPopup}
        onSuccess={fetchPopups}
      />
    </div>
  )
}



