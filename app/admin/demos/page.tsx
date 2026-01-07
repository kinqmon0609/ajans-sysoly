"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDemos } from "@/lib/demo-context"
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import { DemoFormDialog } from "@/components/demo-form-dialog"
import { DeleteDemoDialog } from "@/components/delete-demo-dialog"
import type { Demo } from "@/lib/demo-context"

export default function AdminDemosPage() {
  const { demos, loading, toggleStatus } = useDemos()
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null)

  const filteredDemos = demos.filter(
    (demo) =>
      (demo.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (demo.category?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (demo: Demo) => {
    setSelectedDemo(demo)
    setIsFormOpen(true)
  }

  const handleDelete = (demo: Demo) => {
    setSelectedDemo(demo)
    setIsDeleteOpen(true)
  }

  const handleAdd = () => {
    setSelectedDemo(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demo Yönetimi</h1>
          <p className="text-muted-foreground">Tüm demoları görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Demo
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Demo ara..."
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
              <TableHead>Başlık</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredDemos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Demo bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredDemos.map((demo) => (
                <TableRow key={demo.id}>
                  <TableCell className="font-medium">{demo.title}</TableCell>
                  <TableCell>
                    <Badge>{demo.category}</Badge>
                  </TableCell>
                  <TableCell>{demo.price.toLocaleString("tr-TR")} ₺</TableCell>
                  <TableCell>
                    <Badge variant={demo.is_active ? "default" : "secondary"}>
                      {demo.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatus(demo.id)}
                        title={demo.is_active ? "Pasif yap" : "Aktif yap"}
                      >
                        {demo.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(demo)} title="Düzenle">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(demo)}
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

      <DemoFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} demo={selectedDemo} />
      <DeleteDemoDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} demo={selectedDemo} />
    </div>
  )
}
