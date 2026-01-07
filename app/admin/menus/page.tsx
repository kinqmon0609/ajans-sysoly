"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Menu as MenuIcon, Link as LinkIcon, GripVertical } from "lucide-react"
import { toast } from "sonner"

interface Menu {
  id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface MenuItem {
  id: string
  menu_id: string
  page_id: string | null
  label: string
  url: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  page_title?: string
  page_slug?: string
}

interface Page {
  id: string
  title: string
  slug: string
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null)
  const [dragOverItem, setDragOverItem] = useState<MenuItem | null>(null)

  const [menuForm, setMenuForm] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
    display_order: 0
  })

  const [itemForm, setItemForm] = useState({
    menu_id: "",
    page_id: "",
    label: "",
    url: "",
    parent_id: "",
    display_order: 0,
    is_active: true
  })

  useEffect(() => {
    loadMenus()
    loadPages()
  }, [])

  useEffect(() => {
    if (selectedMenu) {
      loadMenuItems(selectedMenu.id)
    }
  }, [selectedMenu])

  async function loadMenus() {
    try {
      const response = await fetch("/api/menus")
      const data = await response.json()
      setMenus(data)
    } catch (error) {
      console.error("Failed to load menus:", error)
      toast.error("Menüler yüklenemedi")
    } finally {
      setLoading(false)
    }
  }

  async function loadPages() {
    try {
      const response = await fetch("/api/pages?includeInactive=true")
      const data = await response.json()
      setPages(data)
    } catch (error) {
      console.error("Failed to load pages:", error)
    }
  }

  async function loadMenuItems(menuId: string) {
    try {
      const response = await fetch(`/api/menus/items?menuId=${menuId}`)
      const data = await response.json()
      console.log('Loaded menu items:', data);
      setMenuItems(data)
    } catch (error) {
      console.error("Failed to load menu items:", error)
      toast.error("Menü öğeleri yüklenemedi")
    }
  }

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, item: MenuItem) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverItem(item)
  }

  const handleDragEnd = async () => {
    if (!draggedItem || !dragOverItem || draggedItem.id === dragOverItem.id) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    try {
      // Yeni sıralamayı oluştur
      const items = [...menuItems]
      const draggedIndex = items.findIndex(i => i.id === draggedItem.id)
      const targetIndex = items.findIndex(i => i.id === dragOverItem.id)

      // Öğeleri yer değiştir
      items.splice(draggedIndex, 1)
      items.splice(targetIndex, 0, draggedItem)

      // Display order'ı güncelle
      const updatedItems = items.map((item, index) => ({
        ...item,
        display_order: index
      }))

      setMenuItems(updatedItems)

      // API'ye kaydet - tüm item'ı gönder
      await fetch(`/api/menus/items?id=${draggedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draggedItem,
          display_order: targetIndex
        })
      })

      toast.success("Sıralama güncellendi")
    } catch (error) {
      console.error("Failed to update order:", error)
      toast.error("Sıralama güncellenemedi")
      // Reload to get correct state
      if (selectedMenu) {
        loadMenuItems(selectedMenu.id)
      }
    } finally {
      setDraggedItem(null)
      setDragOverItem(null)
    }
  }

  function openMenuDialog(menu?: Menu) {
    if (menu) {
      setEditingMenu(menu)
      setMenuForm({
        name: menu.name,
        slug: menu.slug,
        description: menu.description || "",
        is_active: menu.is_active,
        display_order: menu.display_order
      })
    } else {
      setEditingMenu(null)
      setMenuForm({
        name: "",
        slug: "",
        description: "",
        is_active: true,
        display_order: 0
      })
    }
    setIsMenuDialogOpen(true)
  }

  function openItemDialog(item?: MenuItem) {
    if (!selectedMenu) {
      toast.error("Önce bir menü seçin")
      return
    }

    if (item) {
      setEditingItem(item)
      setItemForm({
        menu_id: item.menu_id,
        page_id: item.page_id || "",
        label: item.label,
        url: item.url || "",
        parent_id: item.parent_id || "",
        display_order: item.display_order,
        is_active: item.is_active
      })
    } else {
      setEditingItem(null)
      setItemForm({
        menu_id: selectedMenu.id,
        page_id: "",
        label: "Yeni Öğe",
        url: "",
        parent_id: "",
        display_order: menuItems.length,
        is_active: true
      })
    }
    setIsItemDialogOpen(true)
  }

  async function saveMenu() {
    try {
      const url = editingMenu ? `/api/menus/${editingMenu.id}` : "/api/menus"
      const method = editingMenu ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuForm)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save menu")
      }

      toast.success(editingMenu ? "Menü güncellendi" : "Menü oluşturuldu")
      setIsMenuDialogOpen(false)
      loadMenus()
    } catch (error: any) {
      console.error("Failed to save menu:", error)
      toast.error(error.message || "Menü kaydedilemedi")
    }
  }

  async function saveMenuItem() {
    try {
      const url = editingItem ? `/api/menus/items?id=${editingItem.id}` : "/api/menus/items"
      const method = editingItem ? "PUT" : "POST"

      // Debug: Form verilerini logla
      console.log('🔍 Saving menu item with data:', {
        ...itemForm,
        page_id: itemForm.page_id || null,
        url: itemForm.url || null,
        parent_id: itemForm.parent_id || null
      })
      console.log('🔍 Current parent_id in form:', itemForm.parent_id);
      console.log('🔍 Parent details for this ID:', menuItems.find(item => item.id === itemForm.parent_id));

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          page_id: itemForm.page_id || null,
          url: itemForm.url || null,
          parent_id: itemForm.parent_id || null
        })
      })

      if (!response.ok) throw new Error("Failed to save menu item")

      toast.success(editingItem ? "Öğe güncellendi" : "Öğe eklendi")
      setIsItemDialogOpen(false)
      if (selectedMenu) loadMenuItems(selectedMenu.id)
    } catch (error) {
      console.error("Failed to save menu item:", error)
      toast.error("Öğe kaydedilemedi")
    }
  }

  async function deleteMenu(id: string) {
    if (!confirm("Bu menüyü silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/menus?id=${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete menu")

      toast.success("Menü silindi")
      if (selectedMenu?.id === id) setSelectedMenu(null)
      loadMenus()
    } catch (error) {
      console.error("Failed to delete menu:", error)
      toast.error("Menü silinemedi")
    }
  }

  async function deleteMenuItem(id: string) {
    if (!confirm("Bu öğeyi silmek istediğinize emin misiniz?")) return

    try {
      const response = await fetch(`/api/menus/items?id=${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete menu item")

      toast.success("Öğe silindi")
      if (selectedMenu) loadMenuItems(selectedMenu.id)
    } catch (error) {
      console.error("Failed to delete menu item:", error)
      toast.error("Öğe silinemedi")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menü Yönetimi</h1>
          <p className="text-muted-foreground">Menüleri ve menü öğelerini yönetin</p>
        </div>
        <Button onClick={() => openMenuDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Menü
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sol Taraf - Menüler */}
        <Card>
          <CardHeader>
            <CardTitle>Menüler</CardTitle>
            <CardDescription>Tüm menülerinizi görüntüleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {menus.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz menü oluşturulmamış
              </div>
            ) : (
              menus.map((menu) => (
                <div
                  key={menu.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMenu?.id === menu.id ? "bg-accent border-primary" : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedMenu(menu)}
                >
                  <div className="flex items-center gap-3">
                    <MenuIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{menu.name}</h3>
                      <p className="text-sm text-muted-foreground">{menu.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {menu.is_active ? (
                      <Badge variant="default">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Pasif</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        openMenuDialog(menu)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMenu(menu.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sağ Taraf - Menü Öğeleri */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedMenu ? `${selectedMenu.name} - Öğeler` : "Menü Öğeleri"}
                </CardTitle>
                <CardDescription>
                  {selectedMenu ? (
                    <>
                      Bu menüye ait öğeler • 
                      <span className="text-primary font-medium ml-1">
                        ⬍⬍ Sürükle-bırak ile sıralayabilirsiniz
                      </span>
                    </>
                  ) : "Bir menü seçin"}
                </CardDescription>
              </div>
              {selectedMenu && (
                <Button onClick={() => openItemDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Öğe Ekle
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedMenu ? (
              <div className="text-center py-8 text-muted-foreground">
                Sol taraftan bir menü seçin
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Bu menüde henüz öğe yok
              </div>
            ) : (
              (() => {
                // Menü öğelerini hiyerarşik olarak gruplandır
                const parentItems = menuItems.filter(item => !item.parent_id).sort((a, b) => a.display_order - b.display_order)
                const childItems = menuItems.filter(item => item.parent_id)
                
                return parentItems.map((parentItem) => {
                  const children = childItems.filter(child => child.parent_id === parentItem.id)
                  
                  return (
                    <div key={parentItem.id} className="space-y-2">
                      {/* Parent Item */}
                      <div 
                        className={`flex items-center justify-between p-4 border rounded-lg transition-colors cursor-move ${
                          draggedItem?.id === parentItem.id ? 'opacity-50 bg-primary/10' : 
                          dragOverItem?.id === parentItem.id ? 'border-primary border-2 bg-primary/5' : 
                          'hover:bg-accent'
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, parentItem)}
                        onDragOver={(e) => handleDragOver(e, parentItem)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {parentItem.label}
                              <Badge variant="outline" className="text-xs">
                                Ana Öğe
                              </Badge>
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {parentItem.page_id ? (
                                <span className="text-primary">📄 {parentItem.page_title || 'Sayfa'}</span>
                              ) : (
                                <span className="text-orange-600">🔗 {parentItem.url || "#"}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {parentItem.is_active ? (
                            <Badge variant="default" className="text-xs">Aktif</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Pasif</Badge>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openItemDialog(parentItem)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMenuItem(parentItem.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Child Items */}
                      {children.length > 0 && (
                        <div className="ml-6 space-y-1">
                          {children.map((child) => (
                            <div 
                              key={child.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/50 border-l-4 border-l-blue-400 hover:bg-blue-100/50 transition-colors cursor-move"
                              draggable
                              onDragStart={(e) => handleDragStart(e, child)}
                              onDragOver={(e) => handleDragOver(e, child)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-blue-600 font-mono text-xs">└─</div>
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                <LinkIcon className="h-3 w-3 text-muted-foreground" />
                                <div>
                                  <h5 className="font-medium text-sm flex items-center gap-2">
                                    {child.label}
                                    <Badge variant="secondary" className="text-xs">
                                      Alt Öğe
                                    </Badge>
                                  </h5>
                                  <p className="text-xs text-muted-foreground">
                                    {child.page_id ? (
                                      <span className="text-primary">📄 {child.page_title || 'Sayfa'}</span>
                                    ) : (
                                      <span className="text-orange-600">🔗 {child.url || "#"}</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {child.is_active ? (
                                  <Badge variant="default" className="text-xs">Aktif</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Pasif</Badge>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => openItemDialog(child)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteMenuItem(child.id)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              })()
            )}
          </CardContent>
        </Card>
      </div>

      {/* Menü Ekleme/Düzenleme Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMenu ? "Menü Düzenle" : "Yeni Menü"}</DialogTitle>
            <DialogDescription>
              Menü bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="menu-name">Menü Adı *</Label>
              <Input
                id="menu-name"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                placeholder="Ana Menü"
              />
            </div>
            <div>
              <Label htmlFor="menu-slug">Slug *</Label>
              <Input
                id="menu-slug"
                value={menuForm.slug}
                onChange={(e) => setMenuForm({ ...menuForm, slug: e.target.value })}
                placeholder="main-menu"
              />
            </div>
            <div>
              <Label htmlFor="menu-description">Açıklama</Label>
              <Textarea
                id="menu-description"
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                placeholder="Menü açıklaması..."
              />
            </div>
            <div>
              <Label htmlFor="menu-order">Sıralama</Label>
              <Input
                id="menu-order"
                type="number"
                value={menuForm.display_order}
                onChange={(e) => setMenuForm({ ...menuForm, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="menu-active">Aktif</Label>
              <Switch
                id="menu-active"
                checked={menuForm.is_active}
                onCheckedChange={(checked) => setMenuForm({ ...menuForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMenuDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={saveMenu}>
              {editingMenu ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menü Öğesi Ekleme/Düzenleme Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Öğe Düzenle" : "Yeni Öğe"}</DialogTitle>
            <DialogDescription>
              Menü öğesi bilgilerini girin (Sayfa veya URL)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-label">Etiket *</Label>
              <Input
                id="item-label"
                value={itemForm.label}
                onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                placeholder="Ana Sayfa"
              />
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Alt Menü Nasıl Oluşturulur?</h4>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>1.</strong> Ana öğe: Etiket yazın, "Ana menü öğesi" seçin</p>
                <p><strong>2.</strong> Alt öğe: Etiket yazın, "Üst Öğe" kısmından ana öğeyi seçin</p>
                <p><strong>3.</strong> Alt öğe ana öğenin altında görünür! ✨</p>
                <p className="text-green-600 font-medium">✅ Artık daha basit ve anlaşılır!</p>
              </div>
            </div>
            <div>
              <Label htmlFor="item-page">Sayfa</Label>
              <Select
                value={itemForm.page_id || "none"}
                onValueChange={(value) => setItemForm({ ...itemForm, page_id: value === "none" ? "" : value, url: value === "none" ? itemForm.url : "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bir sayfa seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok (URL kullanılacak)</SelectItem>
                  {pages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="item-parent">Üst Öğe (Alt menü için)</Label>
              <Select
                value={(() => {
                  if (!itemForm.parent_id) return "none";
                  const parent = menuItems.find(item => item.id === itemForm.parent_id);
                  return parent ? `${parent.label}|${parent.id}` : "none";
                })()}
                onValueChange={(value) => {
                  console.log('🔍 Parent selected:', value);
                  if (value === "none") {
                    console.log('🔍 Setting parent_id to empty string');
                    setItemForm({ ...itemForm, parent_id: "" })
                  } else {
                    const [label, id] = value.split('|');
                    console.log('🔍 Parsed label:', label, 'ID:', id);
                    const selectedParent = menuItems.find(item => item.id === id);
                    console.log('🔍 Selected parent details:', selectedParent);
                    console.log('🔍 Setting parent_id to:', id);
                    setItemForm({ ...itemForm, parent_id: id })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ana menü öğesi olarak ekle..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ana menü öğesi (Parent yok)</SelectItem>
                  {(() => {
                    const parentItems = menuItems.filter(item => !item.parent_id);
                    console.log('🔍 Available parent items:', parentItems);
                    console.log('🔍 All menu items:', menuItems);
                    
                    // Her menü öğesinin ID'sini ve label'ını detaylı logla
                    parentItems.forEach((item, index) => {
                      console.log(`🔍 Parent ${index + 1}: "${item.label}" -> ID: ${item.id}`);
                    });
                    
                    return parentItems.map((item, index) => (
                      <SelectItem key={item.id} value={`${item.label}|${item.id}`}>
                        {index + 1}. {item.label} (ID: {item.id.substring(0, 8)}...)
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="item-url">
                Özel URL {itemForm.page_id && <span className="text-xs text-muted-foreground">(Sayfa seçili ise kullanılmaz)</span>}
              </Label>
              <Input
                id="item-url"
                value={itemForm.url}
                onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                placeholder="https://example.com"
                disabled={!!itemForm.page_id}
              />
            </div>
            <div>
              <Label htmlFor="item-order">Sıralama</Label>
              <Input
                id="item-order"
                type="number"
                value={itemForm.display_order}
                onChange={(e) => setItemForm({ ...itemForm, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="item-active">Aktif</Label>
              <Switch
                id="item-active"
                checked={itemForm.is_active}
                onCheckedChange={(checked) => setItemForm({ ...itemForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={saveMenuItem}>
              {editingItem ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

