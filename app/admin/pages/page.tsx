"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { usePages } from "@/lib/pages-context"
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Loader2, ExternalLink } from "lucide-react"
import { PageFormDialog } from "@/components/page-form-dialog"
import { DeletePageDialog } from "@/components/delete-page-dialog"
import Link from "next/link"
import type { Page } from "@/lib/pages-context"

export default function AdminPagesPage() {
  const { pages, loading, toggleStatus } = usePages()
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (page: Page) => {
    setSelectedPage(page)
    setIsFormOpen(true)
  }

  const handleDelete = (page: Page) => {
    setSelectedPage(page)
    setIsDeleteOpen(true)
  }

  const handleAdd = () => {
    setSelectedPage(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sayfa Yönetimi</h1>
          <p className="text-muted-foreground">Dinamik sayfaları görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sayfa
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Sayfa ara..."
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
              <TableHead>Slug</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredPages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Sayfa bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <code className="text-xs">/{page.slug}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.is_active ? "default" : "secondary"}>
                      {page.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatus(page.id)}
                        title={page.is_active ? "Pasif yap" : "Aktif yap"}
                      >
                        {page.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Elementor ile Düzenle">
                        <Link href={`/admin/pages/${page.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Önizle">
                        <Link href={`/${page.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(page)}
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

      <PageFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} page={selectedPage} />
      <DeletePageDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} page={selectedPage} />
    </div>
  )
}
