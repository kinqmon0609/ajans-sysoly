"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react"
import { PackageFormDialog, type Package } from "@/components/package-form-dialog"
import { DeletePackageDialog } from "@/components/delete-package-dialog"
import { useToast } from "@/hooks/use-toast"

export default function AdminPackagesPage() {
  const { toast } = useToast()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/packages?includeInactive=true")
      if (!response.ok) throw new Error("Failed to fetch packages")
      const data = await response.json()
      setPackages(data.packages || [])
    } catch (error) {
      console.error("Error fetching packages:", error)
      toast({
        title: "Hata",
        description: "Paketler yüklenirken hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg)
    setIsFormOpen(true)
  }

  const handleDelete = (pkg: Package) => {
    setSelectedPackage(pkg)
    setIsDeleteOpen(true)
  }

  const handleAdd = () => {
    setSelectedPackage(null)
    setIsFormOpen(true)
  }

  const toggleStatus = async (id: string) => {
    try {
      const pkg = packages.find((p) => p.id === id)
      if (!pkg) return

      const response = await fetch(`/api/packages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...pkg,
          is_active: !pkg.is_active,
        }),
      })

      if (!response.ok) throw new Error("Failed to update package status")

      toast({
        title: "Durum güncellendi",
        description: `Paket ${!pkg.is_active ? "aktif" : "pasif"} edildi`,
      })

      fetchPackages()
    } catch (error) {
      console.error("Error toggling package status:", error)
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
          <h1 className="text-3xl font-bold">Paket Yönetimi</h1>
          <p className="text-muted-foreground">Paketleri görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Paket
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Paket ara..."
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
              <TableHead>Paket Adı</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Özellik Sayısı</TableHead>
              <TableHead>Sıralama</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredPackages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Paket bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredPackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.price.toLocaleString("tr-TR")} ₺</TableCell>
                  <TableCell>{pkg.features?.length || 0} özellik</TableCell>
                  <TableCell>{pkg.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatus(pkg.id)}
                        title={pkg.is_active ? "Pasif yap" : "Aktif yap"}
                      >
                        {pkg.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)} title="Düzenle">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(pkg)}
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

      <PackageFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        package={selectedPackage}
        onSuccess={fetchPackages}
      />
      <DeletePackageDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        package={selectedPackage}
        onSuccess={fetchPackages}
      />
    </div>
  )
}

